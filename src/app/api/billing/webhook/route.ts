import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { markFeePaid } from "@/lib/fees";

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity?: {
        notes?: { feeId?: string; studentId?: string };
      };
    };
    order?: {
      entity?: {
        notes?: { feeId?: string; studentId?: string };
      };
    };
  };
}

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET not set — rejecting all webhook calls.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  // Signature is computed over the RAW body — must read as text before any
  // JSON.parse, or the signature check will fail even for genuine requests.
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  // Timing-safe comparison — a plain === leaks timing information that
  // could theoretically help an attacker forge a valid signature.
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  const isValid =
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

  if (!isValid) {
    console.warn("[razorpay-webhook] signature mismatch — rejecting.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: RazorpayWebhookPayload;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload." }, { status: 400 });
  }

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const feeId =
      event.payload.payment?.entity?.notes?.feeId ?? event.payload.order?.entity?.notes?.feeId;

    if (!feeId) {
      console.warn("[razorpay-webhook] captured payment had no feeId in notes — nothing to mark paid.");
      return NextResponse.json({ ok: true, note: "No feeId on payment notes." });
    }

    try {
      await markFeePaid(feeId);
      console.log(`[razorpay-webhook] marked ${feeId} paid.`);
    } catch (err) {
      console.error(`[razorpay-webhook] failed to mark ${feeId} paid`, err);
      return NextResponse.json({ error: "Failed to update fee record." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
