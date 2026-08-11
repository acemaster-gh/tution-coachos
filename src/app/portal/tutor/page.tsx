import { getSession } from "@/lib/session";
import { getStudentsByTutor, attendancePercent } from "@/lib/students";
import { listFees } from "@/lib/fees";
import { computeRiskScore, type RiskTier } from "@/lib/risk";

const TIER_STYLE: Record<RiskTier, string> = {
  high: "text-red-pen border-red-pen/40",
  medium: "text-highlighter border-highlighter/60 bg-highlighter/10",
  low: "text-ink-soft border-rule-line",
};
const TIER_LABEL: Record<RiskTier, string> = { high: "High risk", medium: "Watch", low: "On track" };

export default async function TutorPortal() {
  const session = await getSession();
  const [students, allFees] = session
    ? await Promise.all([getStudentsByTutor(session.sub), listFees()])
    : [[], []];

  const withRisk = students
    .map((s) => ({
      student: s,
      risk: computeRiskScore(s, allFees.filter((f) => f.studentId === s.id)),
    }))
    .sort((a, b) => b.risk.score - a.risk.score); // highest risk first

  return (
    <div>
      <p className="font-marginalia text-2xl text-red-pen -rotate-1">your batches</p>
      <h1 className="font-display text-3xl font-semibold mb-8">Student roster</h1>

      {withRisk.length === 0 ? (
        <p className="text-ink-soft">No students assigned to you yet.</p>
      ) : (
        <div className="rounded-sm border border-rule-line bg-paper-raised divide-y divide-rule-line">
          {withRisk.map(({ student: s, risk }) => {
            const latestSubject = s.scores.at(-1)?.subject ?? "—";
            return (
              <a
                key={s.id}
                href={`/portal/tutor/student/${s.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-paper transition-colors"
              >
                <div>
                  <p className="font-medium text-ink">{s.name}</p>
                  <p className="text-sm text-ink-soft">Class {s.grade} · {latestSubject} · {attendancePercent(s)}% attendance</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-xs font-semibold uppercase tracking-wide border rounded-sm px-2 py-1 ${TIER_STYLE[risk.tier]}`}>
                    {TIER_LABEL[risk.tier]} · {risk.score}
                  </span>
                  {risk.tier !== "low" && (
                    <p className="text-xs text-ink-soft mt-1 max-w-[220px]">
                      {risk.factors.filter((f) => f.points > 0).map((f) => f.detail).join(" · ")}
                    </p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}

      <div className="mt-6 rounded-sm border border-dashed border-rule-line p-6 text-sm text-ink-soft">
        Sorted by risk score (0–100): score trend, recent attendance, and
        fee status combined. This is a broader signal than the alert
        emails — those still only fire on the specific three-test-dip or
        low-attendance rule, unchanged from before.
      </div>
    </div>
  );
}
