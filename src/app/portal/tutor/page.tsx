const students = [
  { name: "Aarav Sharma", subject: "Chemistry", status: "flagged", note: "3-test dip, alert sent" },
  { name: "Diya Patel", subject: "Physics", status: "on-track", note: "steady 80%+" },
  { name: "Kabir Singh", subject: "Chemistry", status: "on-track", note: "improved after retest" },
  { name: "Ishaan Verma", subject: "Biology", status: "flagged", note: "attendance dropped to 71%" },
];

const statusStyle: Record<string, string> = {
  flagged: "text-red-pen border-red-pen/40",
  "on-track": "text-ink-soft border-rule-line",
};

export default function TutorPortal() {
  return (
    <div>
      <p className="font-marginalia text-2xl text-red-pen -rotate-1">your batches</p>
      <h1 className="font-display text-3xl font-semibold mb-8">Student roster</h1>

      <div className="rounded-sm border border-rule-line bg-paper-raised divide-y divide-rule-line">
        {students.map((s) => (
          <div key={s.name} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="font-medium text-ink">{s.name}</p>
              <p className="text-sm text-ink-soft">{s.subject}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block text-xs font-semibold uppercase tracking-wide border rounded-sm px-2 py-1 ${statusStyle[s.status]}`}>
                {s.status === "flagged" ? "Needs attention" : "On track"}
              </span>
              <p className="text-xs text-ink-soft mt-1">{s.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-sm border border-dashed border-rule-line p-6 text-sm text-ink-soft">
        Placeholder roster. Phase 3 replaces this with real test-score and
        attendance data, and generates the "flagged" status automatically
        from the three-test-dip rule shown on the homepage.
      </div>
    </div>
  );
}
