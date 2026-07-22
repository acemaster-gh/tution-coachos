import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { enrollStudent } from "@/lib/enrollment";
import { getUserByEmail } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Only admins can enroll students." }, { status: 403 });
  }

  let body: {
    leadId?: string;
    studentName?: string;
    grade?: string;
    subject?: string;
    tutorId?: string;
    parentName?: string;
    parentEmail?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { studentName, grade, subject, tutorId, parentName, parentEmail, leadId } = body;
  if (!studentName || !grade || !subject || !tutorId || !parentName || !parentEmail) {
    return NextResponse.json(
      { error: "studentName, grade, subject, tutorId, parentName, and parentEmail are all required." },
      { status: 400 }
    );
  }

  const existing = await getUserByEmail(parentEmail);
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const result = await enrollStudent({ leadId, studentName, grade, subject, tutorId, parentName, parentEmail });
  return NextResponse.json({ ok: true, ...result });
}
