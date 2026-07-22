import { hasThreeTestDip } from "@/lib/students";
import type { TestScore } from "@/lib/types";

interface DashboardPreviewProps {
  studentName?: string;
  subjectLabel?: string;
  weekLabel?: string;
  scores?: TestScore[];
  attendancePct?: number;
  feeStatus?: string;
  annotation?: string;
  showMarginalia?: boolean;
}

const DEFAULT_SCORES: TestScore[] = [
  { date: "2026-05-04", subject: "Chemistry", score: 85, maxScore: 100 },
  { date: "2026-05-18", subject: "Chemistry", score: 78, maxScore: 100 },
  { date: "2026-06-01", subject: "Chemistry", score: 58, maxScore: 100 },
  { date: "2026-06-15", subject: "Chemistry", score: 62, maxScore: 100 },
  { date: "2026-06-29", subject: "Chemistry", score: 74, maxScore: 100 },
  { date: "2026-07-13", subject: "Chemistry", score: 84, maxScore: 100 },
  { date: "2026-07-20", subject: "Chemistry", score: 91, maxScore: 100 },
];

const CHART_WIDTH = 320;
const Y_TOP = 20;
const Y_BOTTOM = 125;

function buildChart(scores: TestScore[]) {
  const pct = scores.map((s) => s.score / s.maxScore);
  const points = pct.map((p, i) => ({
    x: scores.length > 1 ? (i * CHART_WIDTH) / (scores.length - 1) : CHART_WIDTH / 2,
    y: Y_BOTTOM - p * (Y_BOTTOM - Y_TOP),
  }));

  let minIndex = 0;
  pct.forEach((p, i) => {
    if (p < pct[minIndex]) minIndex = i;
  });

  const flagged = hasThreeTestDip(scores);
  const recovering = flagged && pct[pct.length - 1] > pct[minIndex] + 0.05 && minIndex < pct.length - 1;

  return { points, minIndex, flagged, recovering };
}

export default function DashboardPreview({
  studentName = "Aarav Sharma",
  subjectLabel = "Chemistry",
  weekLabel = "week 7",
  scores = DEFAULT_SCORES,
  attendancePct = 96,
  feeStatus = "paid",
  annotation = "alert sent to Mr. Kumar — three-test dip, batch 10B",
  showMarginalia = true,
}: DashboardPreviewProps) {
  const { points, minIndex, flagged, recovering } = buildChart(scores);
  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const minPoint = points[minIndex];
  const lastPoint = points[points.length - 1];

  return (
    <div className="relative w-full max-w-md">
      <div className="rounded-sm border border-rule-line bg-paper-raised shadow-[6px_6px_0_0_var(--ink)] p-5">
        <div className="flex items-center justify-between border-b border-rule-line pb-3 mb-4">
          <div>
            <p className="font-display text-sm text-ink-soft">Progress Report</p>
            <p className="font-display text-lg font-semibold">{studentName} — {subjectLabel}</p>
          </div>
          <span className="font-marginalia text-2xl text-red-pen rotate-[-6deg] select-none">
            {weekLabel}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${CHART_WIDTH} 140`}
          className="w-full h-auto"
          role="img"
          aria-label={`${subjectLabel} test score trend for ${studentName}`}
        >
          {[20, 55, 90, 125].map((y) => (
            <line key={y} x1="0" y1={y} x2={CHART_WIDTH} y2={y} stroke="var(--rule-line)" strokeWidth="1" />
          ))}

          <polyline
            points={polylinePoints}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, i) => {
            const isRecoveryPoint = recovering && i > minIndex;
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill={isRecoveryPoint ? "var(--highlighter)" : "var(--ink)"}
                stroke={isRecoveryPoint ? "var(--ink)" : "none"}
                strokeWidth={isRecoveryPoint ? 1.5 : 0}
              />
            );
          })}

          {flagged && (
            <ellipse
              cx={minPoint.x}
              cy={minPoint.y}
              rx="42"
              ry="26"
              fill="none"
              stroke="var(--red-pen)"
              strokeWidth="2.5"
              strokeDasharray="3 4"
              transform={`rotate(-8 ${minPoint.x} ${minPoint.y})`}
            />
          )}

          {recovering && (
            <>
              <path
                d={`M ${lastPoint.x - 60} ${lastPoint.y + 35} C ${lastPoint.x - 40} ${lastPoint.y + 15}, ${lastPoint.x - 15} ${lastPoint.y + 8}, ${lastPoint.x - 5} ${lastPoint.y + 3}`}
                fill="none"
                stroke="var(--red-pen)"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="var(--red-pen)" />
                </marker>
              </defs>
            </>
          )}
        </svg>

        {flagged && (
          <p className="font-marginalia text-xl text-red-pen mt-1 -rotate-2 leading-none">
            {annotation}
          </p>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-rule-line text-sm">
          <span className="text-ink-soft">Attendance: {attendancePct}%</span>
          <span className="text-ink-soft">Fee status: {feeStatus}</span>
        </div>
      </div>

      {showMarginalia && (
        <span className="absolute -top-4 -right-3 font-marginalia text-xl text-ink-soft rotate-6 select-none hidden sm:block">
          this is the moment a parent decides to stay
        </span>
      )}
    </div>
  );
}
