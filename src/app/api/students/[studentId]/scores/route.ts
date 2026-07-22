import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStudentById, recordScore } from "@/lib/students";
import { runAlertCheck } from "@/lib/alerts";

export async function POST(request: Request, { params }: { params: Promise<{ studentId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (session.role !== "tutor" && session.role !== "admin") {
    return NextResponse.json({ error: "Only tutors and admins can record scores." }, { status: 403 });
  }

  const { studentId } = await params;
  const student = await getStudentById(studentId);
  if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });
  if (session.role === "tutor" && student.tutorId !== session.sub) {
    return NextResponse.json({ error: "This student isn't on your roster." }, { status: 403 });
  }

  let body: { subject?: string; score?: number; maxScore?: number; date?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  const { subject, score, maxScore } = body;
  if (!subject || typeof score !== "number" || typeof maxScore !== "number" || maxScore <= 0) {
    return NextResponse.json({ error: "subject, score, and maxScore are all required (score/maxScore as numbers)." }, { status: 400 });
  }
  if (score < 0 || score > maxScore) {
    return NextResponse.json({ error: "score must be between 0 and maxScore." }, { status: 400 });
  }

  const updated = await recordScore(studentId, {
    subject,
    score,
    maxScore,
    date: body.date || new Date().toISOString().slice(0, 10),
  });

  // A new score can start (or resolve) a three-test dip — check for a fresh alert.
  await runAlertCheck().catch((err) => console.error("[alerts] post-score check failed", err));

  return NextResponse.json({ ok: true, student: updated });
}
