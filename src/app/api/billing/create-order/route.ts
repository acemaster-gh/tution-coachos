import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getSession } from "@/lib/session";
import { listFees } from "@/lib/fees";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to pay a fee." }, { status: 401 });
  }

  let body: { feeId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (!body.feeId) {
    return NextResponse.json({ error: "feeId is required." }, { status: 400 });
  }

  const fees = await listFees();
  const fee = fees.find((f) => f.id === body.feeId);
  if (!fee) {
    return NextResponse.json({ error: "That fee record doesn't exist." }, { status: 404 });
  }
  if (fee.status === "paid") {
    return NextResponse.json({ error: "This fee is already marked paid." }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      {
        error:
          "Payments aren't configured yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET " +
          "in .env.local (Razorpay test-mode keys work fine for development) to enable this button.",
      },
      { status: 501 }
    );
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: fee.amount * 100, // Razorpay expects paise
      currency: "INR",
      receipt: fee.id,
      notes: { feeId: fee.id, studentId: fee.studentId },
    });

    return NextResponse.json({ order, keyId });
  } catch (err) {
    console.error("[razorpay] order creation failed", err);
    return NextResponse.json({ error: "Couldn't create the payment order. Please try again shortly." }, { status: 502 });
  }
}
