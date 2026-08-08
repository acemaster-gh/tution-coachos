import { NextResponse } from "next/server";
import { appendToCollection } from "@/lib/db";
import { notifyAdminOfNewLead } from "@/lib/messaging";
import { checkLeadRate, getClientIP } from "@/lib/rate-limit";
import type { Lead } from "@/lib/types";

interface LeadPayload {
  parentName?: string;
  phone?: string;
  grade?: string;
  subject?: string;
}

export async function POST(request: Request) {
  // ── Rate limiting (Security fix #4) ────────────────────────────────
  // 3 submissions per minute per IP — prevents spam that racks up
  // notification costs (each lead triggers Twilio + Resend calls).
  const ip = getClientIP(request);
  const limit = checkLeadRate(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many enquiries — please wait a minute and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The enquiry data was malformed." }, { status: 400 });
  }

  const { parentName, phone, grade, subject } = body;
  if (!parentName || !phone || !grade || !subject) {
    return NextResponse.json(
      { error: "Parent name, phone, grade, and subject are all required." },
      { status: 400 }
    );
  }

  const lead: Lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    parentName,
    phone,
    grade,
    subject,
    receivedAt: new Date().toISOString(),
  };

  // JSON-file append is fine for a demo; concurrent writes under real
  // traffic need a real DB (Phase 4 note applies here too) because this
  // read-modify-write isn't atomic across simultaneous requests.
  await appendToCollection<Lead>("leads.json", lead);
  await notifyAdminOfNewLead(lead);

  return NextResponse.json({ ok: true });
}
