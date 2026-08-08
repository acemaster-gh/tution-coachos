import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { getStudentsByTutor, getStudentStatus, attendancePercent } from "@/lib/students";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `My Students — ${siteConfig.instituteName}`,
};

const ACCENT_GRADIENTS = [
  "linear-gradient(135deg, var(--red-pen), #d4543c)",
  "linear-gradient(135deg, var(--amber), #f5b851)",
  "linear-gradient(135deg, var(--green), #34d399)",
  "linear-gradient(135deg, var(--blue), #60a5fa)",
];

function getGradient(name: string) {
  return ACCENT_GRADIENTS[name.charCodeAt(0) % ACCENT_GRADIENTS.length];
}

function AvatarInitials({ name, flagged }: { name: string; flagged: boolean }) {
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
      style={{
        background: flagged
          ? "linear-gradient(135deg, var(--red-pen), #d4543c)"
          : getGradient(name),
      }}
    >
      {initials}
    </div>
  );
}

export default async function TutorPortal() {
  const session = await getSession();
  const students = session ? await getStudentsByTutor(session.sub) : [];

  const flagged = students.filter((s) => getStudentStatus(s).flagged);
  const onTrack = students.filter((s) => !getStudentStatus(s).flagged);

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <span className="section-label">your batches</span>
        <h1 className="font-display text-3xl font-semibold text-ink mt-1">Student roster</h1>
        {students.length > 0 && (
          <p className="text-ink-soft text-sm mt-1">
            <strong className="text-ink">{students.length}</strong> students assigned to you
          </p>
        )}
      </div>

      {students.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: "var(--paper-card)", border: "1px solid rgba(201,194,174,0.5)", boxShadow: "var(--shadow-sm)" }}
        >
          <p className="text-5xl mb-4" aria-hidden>👥</p>
          <p className="font-display text-xl font-semibold text-ink mb-2">No students yet</p>
          <p className="text-ink-soft text-sm">Ask the admin to assign students to your account.</p>
        </div>
      ) : (
        <>
          {/* Summary pills */}
          <div className="flex flex-wrap gap-2 mb-7">
            <span className="badge badge-muted">{students.length} total</span>
            {flagged.length > 0 && (
              <span className="badge badge-red">⚠️ {flagged.length} need{flagged.length === 1 ? "s" : ""} attention</span>
            )}
            {onTrack.length > 0 && (
              <span className="badge badge-green">✓ {onTrack.length} on track</span>
            )}
          </div>

          {/* Flagged students */}
          {flagged.length > 0 && (
            <div className="mb-6 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-red-pen">⚠ Needs attention</p>
                <span className="badge badge-red">{flagged.length}</span>
              </div>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(193,68,45,0.2)", background: "var(--paper-card)", boxShadow: "var(--shadow-xs)" }}
              >
                {flagged.map((s, idx) => {
                  const status    = getStudentStatus(s);
                  const lastScore = s.scores.at(-1);
                  const pct       = lastScore ? Math.round((lastScore.score / lastScore.maxScore) * 100) : null;
                  const attPct    = attendancePercent(s);

                  return (
                    <a
                      key={s.id}
                      href={`/portal/tutor/student/${s.id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-red-pen-bg transition-colors group"
                      style={{ borderTop: idx > 0 ? "1px solid var(--rule-faint)" : "none" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarInitials name={s.name} flagged />
                        <div className="min-w-0">
                          <p className="font-semibold text-ink text-sm group-hover:text-red-pen transition-colors">
                            {s.name}
                          </p>
                          <p className="text-xs text-ink-soft mt-0.5">
                            Class {s.grade} · {lastScore?.subject ?? "—"} · {attPct}% attendance
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {status.reasons.map((r: string) => (
                              <span key={r} className="badge badge-red" style={{ fontSize: "0.6rem" }}>{r}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {pct !== null && (
                          <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-bold text-ink">{pct}%</span>
                            <span className="text-xs text-ink-muted">last test</span>
                          </div>
                        )}
                        <svg className="w-4 h-4 text-ink-muted group-hover:text-red-pen transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* On-track students */}
          {onTrack.length > 0 && (
            <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-green">✓ On track</p>
                <span className="badge badge-green">{onTrack.length}</span>
              </div>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(201,194,174,0.5)", background: "var(--paper-card)", boxShadow: "var(--shadow-xs)" }}
              >
                {onTrack.map((s, idx) => {
                  const lastScore = s.scores.at(-1);
                  const pct       = lastScore ? Math.round((lastScore.score / lastScore.maxScore) * 100) : null;
                  const attPct    = attendancePercent(s);

                  return (
                    <a
                      key={s.id}
                      href={`/portal/tutor/student/${s.id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-paper transition-colors group"
                      style={{ borderTop: idx > 0 ? "1px solid var(--rule-faint)" : "none" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarInitials name={s.name} flagged={false} />
                        <div className="min-w-0">
                          <p className="font-semibold text-ink text-sm group-hover:text-red-pen transition-colors">
                            {s.name}
                          </p>
                          <p className="text-xs text-ink-soft mt-0.5">
                            Class {s.grade} · {lastScore?.subject ?? "—"} · {attPct}% attendance
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {pct !== null && (
                          <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-bold text-ink">{pct}%</span>
                            <span className="text-xs text-ink-muted">last test</span>
                          </div>
                        )}
                        <span className="badge badge-green">On track</span>
                        <svg className="w-4 h-4 text-ink-muted group-hover:text-red-pen transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Info note */}
      <div
        className="mt-8 rounded-xl p-5 text-sm text-ink-soft animate-fade-in-up"
        style={{ border: "1px dashed rgba(201,194,174,0.7)", background: "rgba(255,255,255,0.4)", animationDelay: "0.3s" }}
      >
        <p className="font-semibold text-ink mb-1 flex items-center gap-1.5">ℹ️ How flags work</p>
        A student is flagged when their score drops across three consecutive tests, or attendance falls below 75%.
        Click any student to mark today's attendance or record a new test score.
      </div>
    </div>
  );
}
