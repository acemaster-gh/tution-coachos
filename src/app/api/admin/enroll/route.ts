import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { enrollStudent } from "@/lib/enrollment";
import { DuplicateError } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit";

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

  // No pre-flight email check — enrollStudent uses appendToCollectionUnique
  // which atomically checks inside the file lock, eliminating the TOCTOU race
  // (Security fix #1). DuplicateError is thrown if the email already exists.
  try {
    const result = await enrollStudent({ leadId, studentName, grade, subject, tutorId, parentName, parentEmail });
    logAuditEvent({
      userId: session.sub, userName: session.name, role: session.role,
      action: "enroll_student", target: result.studentId,
      detail: `Enrolled ${studentName} (parent: ${parentName}, ${parentEmail}).`,
    }).catch(() => {});
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof DuplicateError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err; // unexpected — let the global error handler deal with it
  }
}
