import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStudentById, markAttendance } from "@/lib/students";
import { runAlertCheck } from "@/lib/alerts";
import { attendanceSchema, firstIssueMessage } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ studentId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (session.role !== "tutor" && session.role !== "admin") {
    return NextResponse.json({ error: "Only tutors and admins can mark attendance." }, { status: 403 });
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
  const parsed = attendanceSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  const updated = await markAttendance(studentId, parsed.data.present, parsed.data.date);

  // Attendance can newly cross the 75% threshold — check for a fresh alert.
  await runAlertCheck().catch((err) => console.error("[alerts] post-attendance check failed", err));

  return NextResponse.json({ ok: true, student: updated });
}
