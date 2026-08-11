import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStudentById, recordScore } from "@/lib/students";
import { runAlertCheck } from "@/lib/alerts";
import { scoreSchema, firstIssueMessage } from "@/lib/validation";

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

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  // Coerce score/maxScore from form input (arrives as strings from FormData-derived JSON).
  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.score === "string") candidate.score = Number(candidate.score);
  if (typeof candidate.maxScore === "string") candidate.maxScore = Number(candidate.maxScore);

  const parsed = scoreSchema.safeParse(candidate);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  const updated = await recordScore(studentId, {
    subject: parsed.data.subject,
    score: parsed.data.score,
    maxScore: parsed.data.maxScore,
    date: parsed.data.date || new Date().toISOString().slice(0, 10),
  });

  // A new score can start (or resolve) a three-test dip — check for a fresh alert.
  await runAlertCheck().catch((err) => console.error("[alerts] post-score check failed", err));

  return NextResponse.json({ ok: true, student: updated });
}
