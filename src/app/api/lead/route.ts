import { NextResponse } from "next/server";
import { appendToCollection } from "@/lib/db";
import { notifyAdminOfNewLead } from "@/lib/messaging";
import type { Lead } from "@/lib/types";

interface LeadPayload {
  parentName?: string;
  phone?: string;
  grade?: string;
  subject?: string;
}

export async function POST(request: Request) {
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
