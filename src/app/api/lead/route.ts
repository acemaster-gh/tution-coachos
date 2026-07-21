import { NextResponse } from "next/server";

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

  // Phase 4 hook: replace this with a write to Postgres/Prisma + a
  // WhatsApp/email notification to the institute's admin number.
  console.log("[lead]", { parentName, phone, grade, subject, receivedAt: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
