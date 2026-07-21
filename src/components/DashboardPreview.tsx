export default function DashboardPreview() {
  return (
    <div className="relative w-full max-w-md">
      <div className="rounded-sm border border-rule-line bg-paper-raised shadow-[6px_6px_0_0_var(--ink)] p-5">
        <div className="flex items-center justify-between border-b border-rule-line pb-3 mb-4">
          <div>
            <p className="font-display text-sm text-ink-soft">Progress Report</p>
            <p className="font-display text-lg font-semibold">Aarav Sharma — Chemistry</p>
          </div>
          <span className="font-marginalia text-2xl text-red-pen rotate-[-6deg] select-none">
            week 7
          </span>
        </div>

        <svg viewBox="0 0 320 140" className="w-full h-auto" role="img" aria-label="Chemistry test score trend, dipping then recovering after tutor flag">
          {/* baseline grid */}
          {[20, 55, 90, 125].map((y) => (
            <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="var(--rule-line)" strokeWidth="1" />
          ))}
          {/* score line */}
          <polyline
            points="0,40 55,45 110,95 165,88 220,55 275,35 320,28"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* dip markers (the three-test drop that trips the alert) */}
          <circle cx="55" cy="45" r="3.5" fill="var(--ink)" />
          <circle cx="110" cy="95" r="3.5" fill="var(--ink)" />
          <circle cx="165" cy="88" r="3.5" fill="var(--ink)" />
          {/* recovery after intervention */}
          <circle cx="220" cy="55" r="3.5" fill="var(--highlighter)" stroke="var(--ink)" strokeWidth="1.5" />
          <circle cx="275" cy="35" r="3.5" fill="var(--highlighter)" stroke="var(--ink)" strokeWidth="1.5" />
          <circle cx="320" cy="28" r="3.5" fill="var(--highlighter)" stroke="var(--ink)" strokeWidth="1.5" />

          {/* hand-drawn red-pen circle around the dip */}
          <ellipse
            cx="110"
            cy="90"
            rx="46"
            ry="30"
            fill="none"
            stroke="var(--red-pen)"
            strokeWidth="2.5"
            strokeDasharray="3 4"
            transform="rotate(-8 110 90)"
          />
          {/* red-pen arrow pointing at the recovery */}
          <path
            d="M 240 100 C 235 80, 228 65, 222 58"
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
        </svg>

        <p className="font-marginalia text-xl text-red-pen mt-1 -rotate-2 leading-none">
          alert sent to Mr. Kumar — three-test dip, batch 10B
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-rule-line text-sm">
          <span className="text-ink-soft">Attendance: 96%</span>
          <span className="text-ink-soft">Fee status: paid</span>
        </div>
      </div>

      <span className="absolute -top-4 -right-3 font-marginalia text-xl text-ink-soft rotate-6 select-none hidden sm:block">
        this is the moment a parent decides to stay
      </span>
    </div>
  );
}
