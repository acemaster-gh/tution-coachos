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

  const today      = new Date().toISOString().slice(0, 10);
  const todayRecord = student.attendance.find((a) => a.date === today);
  const status     = getStudentStatus(student);
  const latestScore = student.scores.at(-1);
  const attPct     = attendancePercent(student);
  const lastPct    = latestScore ? Math.round((latestScore.score / latestScore.maxScore) * 100) : null;

  return (
    <div>
      {/* Back link */}
      <a
        href="/portal/tutor"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to roster
      </a>

      {/* Student header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0"
          style={{
            background: status.flagged
              ? "linear-gradient(135deg, var(--red-pen), #d4543c)"
              : "linear-gradient(135deg, var(--green), #34d399)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          {student.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <span className="section-label" style={{ fontSize: "1.1rem" }}>student record</span>
          <h1 className="font-display text-3xl font-semibold text-ink">{student.name}</h1>
          <p className="text-sm text-ink-soft mt-0.5">
            Class {student.grade}
            {latestScore && ` · ${latestScore.subject}`}
          </p>
        </div>
        {status.flagged && (
          <div className="ml-auto shrink-0 hidden sm:flex flex-col items-end gap-1">
            {status.reasons.map((r: string) => (
              <span key={r} className="badge badge-red">{r}</span>
            ))}
          </div>
        )}
      </div>

      {/* Quick stat pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{
            background: attPct >= 75 ? "var(--green-bg)" : "var(--red-pen-bg)",
            border: `1px solid ${attPct >= 75 ? "rgba(22,163,74,0.2)" : "rgba(193,68,45,0.2)"}`,
            color: attPct >= 75 ? "var(--green)" : "var(--red-pen)",
          }}
        >
          📅 {attPct}% attendance
        </div>
        {lastPct !== null && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: "rgba(37,99,235,0.07)",
              border: "1px solid rgba(37,99,235,0.2)",
              color: "var(--blue)",
            }}
          >
            📝 {lastPct}% last test
          </div>
        )}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{ background: "rgba(201,194,174,0.2)", border: "1px solid rgba(201,194,174,0.5)", color: "var(--ink-soft)" }}
        >
          📊 {student.scores.length} tests logged
        </div>
      </div>

      {/* Grid: chart + action forms */}
      <div className="grid md:grid-cols-[1fr_380px] gap-6">
        {/* Left — chart */}
        <div>
          <DashboardPreview
            studentName={student.name}
            subjectLabel={latestScore?.subject ?? "—"}
            weekLabel={`${student.scores.length} tests`}
            scores={student.scores}
            attendancePct={attPct}
            feeStatus="—"
            annotation={status.flagged ? `flag: ${status.reasons.join(", ")}` : ""}
            showMarginalia={false}
          />
        </div>

        {/* Right — forms */}
        <div className="space-y-5">
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--paper-card)", border: "1px solid rgba(201,194,174,0.5)", boxShadow: "var(--shadow-xs)" }}
          >
            <p className="font-semibold text-ink mb-4 flex items-center gap-2">
              <span>📅</span> Today's attendance
              {todayRecord && (
                <span className={`badge ${todayRecord.present ? "badge-green" : "badge-red"}`}>
                  {todayRecord.present ? "Present ✓" : "Absent ✕"}
                </span>
              )}
            </p>
            <AttendanceMarker studentId={student.id} todayRecord={todayRecord} />
          </div>

          <div
            className="rounded-xl p-5"
            style={{ background: "var(--paper-card)", border: "1px solid rgba(201,194,174,0.5)", boxShadow: "var(--shadow-xs)" }}
          >
            <p className="font-semibold text-ink mb-4 flex items-center gap-2">
              <span>📝</span> Record test score
            </p>
            <ScoreEntryForm studentId={student.id} defaultSubject={latestScore?.subject} />
          </div>
        </div>
      </div>

      {/* Score history */}
      {student.scores.length > 0 && (
        <div className="mt-8">
          <p className="font-semibold text-ink mb-4">Score history</p>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(201,194,174,0.5)", background: "var(--paper-card)" }}
          >
            {[...student.scores].reverse().map((sc, idx) => {
              const pct = Math.round((sc.score / sc.maxScore) * 100);
              const isLow = pct < 50;
              const isMid = pct >= 50 && pct < 70;
              return (
                <div
                  key={idx}
                  className="px-5 py-3 flex items-center justify-between gap-4"
                  style={{ borderTop: idx > 0 ? "1px solid var(--rule-faint)" : "none" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-2 h-8 rounded-full shrink-0"
                      style={{
                        background: isLow ? "var(--red-pen)" : isMid ? "var(--amber)" : "var(--green)",
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-ink">{sc.subject}</p>
                      <p className="text-xs text-ink-muted">{new Date(sc.date).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:block w-24 h-1.5 rounded-full bg-rule-faint overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: isLow ? "var(--red-pen)" : isMid ? "var(--amber)" : "var(--green)",
                        }}
                      />
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: isLow ? "var(--red-pen)" : isMid ? "var(--amber)" : "var(--green)" }}
                    >
                      {sc.score}/{sc.maxScore}
                    </span>
                    <span className="text-xs text-ink-muted">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
