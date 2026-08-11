import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getStudentById, attendancePercent, getStudentStatus } from "@/lib/students";
import { getFeesByStudent } from "@/lib/fees";
import { computeRiskScore, type RiskTier } from "@/lib/risk";
import DashboardPreview from "@/components/DashboardPreview";
import AttendanceMarker from "@/components/AttendanceMarker";
import ScoreEntryForm from "@/components/ScoreEntryForm";

const TIER_STYLE: Record<RiskTier, string> = {
  high: "text-red-pen border-red-pen/40",
  medium: "text-highlighter border-highlighter/60 bg-highlighter/10",
  low: "text-ink-soft border-rule-line",
};

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
  const fees = await getFeesByStudent(student.id);
  const risk = computeRiskScore(student, fees);
  const latestSubject = student.scores.at(-1)?.subject;

  return (
    <div>
      <a href="/portal/tutor" className="text-sm text-ink-soft hover:text-ink transition-colors">&larr; Back to roster</a>
      <p className="font-marginalia text-2xl text-red-pen -rotate-1 mt-3">student record</p>
      <h1 className="font-display text-3xl font-semibold mb-8">{student.name}</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
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

          <div className="rounded-sm border border-rule-line bg-paper-raised p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-ink">Dropout risk</p>
              <span className={`text-xs font-semibold uppercase tracking-wide border rounded-sm px-2 py-1 ${TIER_STYLE[risk.tier]}`}>
                {risk.tier} · {risk.score}/100
              </span>
            </div>
            <div className="space-y-2">
              {risk.factors.map((f) => (
                <div key={f.label} className="text-sm">
                  <div className="flex items-center justify-between text-ink-soft">
                    <span>{f.label}</span>
                    <span>{f.points}/{f.maxPoints}</span>
                  </div>
                  <div className="h-1.5 bg-paper rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-red-pen"
                      style={{ width: `${(f.points / f.maxPoints) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>
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
