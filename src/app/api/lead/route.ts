import { NextResponse } from "next/server";
import { addLead } from "@/lib/leads";
import { notifyAdminOfNewLead } from "@/lib/messaging";
import { leadSchema, firstIssueMessage } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  // Public, unauthenticated endpoint — cheap for a spammer to hit
  // repeatedly, real cost to the business (each submission triggers
  // live notification sends once Twilio/Resend are configured). 5
  // submissions per IP, refilling at 1 every 2 minutes — generous for a
  // real family enquiring, punishing for a script.
  const ip = getClientIp(request);
  const limit = checkRateLimit(`lead:${ip}`, { capacity: 5, refillPerSecond: 1 / 120 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many enquiries from this connection. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "The enquiry data was malformed." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  const lead = await addLead(parsed.data);
  await notifyAdminOfNewLead(lead);

  return NextResponse.json({ ok: true });
}
