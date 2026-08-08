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

const CHART_WIDTH = 300;
const Y_TOP = 18;
const Y_BOTTOM = 118;

function buildChart(scores: TestScore[]) {
  const pct = scores.map((s) => s.score / s.maxScore);
  const points = pct.map((p, i) => ({
    x: scores.length > 1 ? (i * CHART_WIDTH) / (scores.length - 1) : CHART_WIDTH / 2,
    y: Y_BOTTOM - p * (Y_BOTTOM - Y_TOP),
  }));

  let minIndex = 0;
  pct.forEach((p, i) => { if (p < pct[minIndex]) minIndex = i; });

  const flagged = hasThreeTestDip(scores);
  const recovering =
    flagged &&
    pct[pct.length - 1] > pct[minIndex] + 0.05 &&
    minIndex < pct.length - 1;

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

  // Build a smooth area path
  const areaPoints = `${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")} ${CHART_WIDTH},${Y_BOTTOM + 10} 0,${Y_BOTTOM + 10}`;

  return (
    <div className="relative w-full max-w-md">
      {/* Main card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--paper-card)",
          border: "1px solid rgba(201,194,174,0.5)",
          boxShadow:
            "0 24px 64px rgba(27,36,48,0.14), 0 8px 24px rgba(27,36,48,0.08), 0 1px 4px rgba(27,36,48,0.04)",
        }}
      >
        {/* Header strip */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, var(--ink) 0%, #2d3e52 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <p className="text-white/50 text-xs mb-0.5 font-medium uppercase tracking-wider">
              Progress Report
            </p>
            <p className="font-display text-base font-semibold text-white">
              {studentName}
            </p>
            <p className="text-white/60 text-xs">{subjectLabel}</p>
          </div>
          <span
            className="font-marginalia text-2xl rotate-[-5deg] select-none"
            style={{ color: "var(--highlighter)" }}
          >
            {weekLabel}
          </span>
        </div>

        {/* Chart area */}
        <div className="px-5 pt-4 pb-1">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} 140`}
            className="w-full h-auto"
            role="img"
            aria-label={`${subjectLabel} test score trend for ${studentName}`}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.06" />
                <stop offset="100%" stopColor="var(--ink)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--ink-soft)" />
                <stop offset="60%" stopColor="var(--red-pen)" />
                <stop offset="100%" stopColor="var(--highlighter)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid lines */}
            {[18, 50, 84, 118].map((y) => (
              <line
                key={y}
                x1="0" y1={y}
                x2={CHART_WIDTH} y2={y}
                stroke="var(--rule-faint)"
                strokeWidth="1"
              />
            ))}

            {/* Area fill */}
            <polygon
              points={areaPoints}
              fill="url(#areaGrad)"
            />

            {/* Main line */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: "1000",
                strokeDashoffset: "0",
                animation: "draw-line 1.5s ease-out forwards",
              }}
            />

            {/* Data points */}
            {points.map((p, i) => {
              const isRecovery = recovering && i > minIndex;
              return (
                <g key={i}>
                  <circle
                    cx={p.x} cy={p.y} r="5"
                    fill={isRecovery ? "var(--highlighter)" : "var(--paper-card)"}
                    stroke={isRecovery ? "var(--amber)" : "var(--ink)"}
                    strokeWidth="2"
                    filter={i === points.length - 1 ? "url(#glow)" : undefined}
                  />
                </g>
              );
            })}

            {/* Dip ellipse */}
            {flagged && (
              <ellipse
                cx={minPoint.x} cy={minPoint.y}
                rx="38" ry="24"
                fill="rgba(193,68,45,0.06)"
                stroke="var(--red-pen)"
                strokeWidth="2"
                strokeDasharray="4 3"
                transform={`rotate(-8 ${minPoint.x} ${minPoint.y})`}
              />
            )}

            {/* Recovery arrow */}
            {recovering && (
              <>
                <path
                  d={`M ${lastPoint.x - 50} ${lastPoint.y + 30} C ${lastPoint.x - 30} ${lastPoint.y + 12}, ${lastPoint.x - 12} ${lastPoint.y + 6}, ${lastPoint.x - 3} ${lastPoint.y + 1}`}
                  fill="none"
                  stroke="var(--highlighter)"
                  strokeWidth="2"
                  markerEnd="url(#arrowGold)"
                />
                <defs>
                  <marker id="arrowGold" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="var(--highlighter)" />
                  </marker>
                </defs>
              </>
            )}
          </svg>
        </div>

        {/* Alert annotation */}
        {flagged && (
          <div className="mx-5 mb-3 px-3 py-2 rounded-lg flex items-center gap-2"
            style={{ background: "var(--red-pen-bg)", border: "1px solid rgba(193,68,45,0.2)" }}>
            <span className="text-red-pen text-sm shrink-0">⚠</span>
            <p className="font-marginalia text-base text-red-pen leading-tight -rotate-0.5">
              {annotation}
            </p>
          </div>
        )}

        {/* Footer stats */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--rule-faint)" }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green" />
            <span className="text-xs text-ink-soft">
              Attendance <strong className="text-ink">{attendancePct}%</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="badge badge-green text-[0.65rem]">{feeStatus}</span>
            <span className="text-xs text-ink-muted">fees</span>
          </div>
        </div>
      </div>

      {showMarginalia && (
        <span className="absolute -top-4 -right-2 font-marginalia text-sm text-ink-soft rotate-6 select-none hidden sm:block">
          this is the moment a parent decides to stay
        </span>
      )}
    </div>
  );
}
