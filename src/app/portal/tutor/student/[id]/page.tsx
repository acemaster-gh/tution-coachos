import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getStudentById, attendancePercent, getStudentStatus } from "@/lib/students";
import DashboardPreview from "@/components/DashboardPreview";
import AttendanceMarker from "@/components/AttendanceMarker";
import ScoreEntryForm from "@/components/ScoreEntryForm";

export default async function TutorStudentDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();
  if (session.role === "tutor" && student.tutorId !== session.sub) {
    redirect("/portal/tutor");
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = student.attendance.find((a) => a.date === today);
  const status = getStudentStatus(student);
  const latestSubject = student.scores.at(-1)?.subject;

  return (
    <div>
      <a href="/portal/tutor" className="text-sm text-ink-soft hover:text-ink transition-colors">&larr; Back to roster</a>
      <p className="font-marginalia text-2xl text-red-pen -rotate-1 mt-3">student record</p>
      <h1 className="font-display text-3xl font-semibold mb-8">{student.name}</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <DashboardPreview
            studentName={student.name}
            subjectLabel={latestSubject ?? "—"}
            weekLabel={`${student.scores.length} tests logged`}
            scores={student.scores}
            attendancePct={attendancePercent(student)}
            feeStatus="—"
            annotation={status.flagged ? `flag: ${status.reasons.join(", ")}` : ""}
            showMarginalia={false}
          />
        </div>

        <div className="space-y-8">
          <div className="rounded-sm border border-rule-line bg-paper-raised p-5">
            <AttendanceMarker studentId={student.id} todayRecord={todayRecord} />
          </div>
          <div className="rounded-sm border border-rule-line bg-paper-raised p-5">
            <ScoreEntryForm studentId={student.id} defaultSubject={latestSubject} />
          </div>
        </div>
      </div>
    </div>
  );
}
