const cards = [
  { label: "New enquiries this week", value: "12", note: "from the site's lead form" },
  { label: "Fees overdue", value: "₹38,400", note: "across 9 students" },
  { label: "Batches near capacity", value: "3 of 11", note: "Class 10 Math is full" },
];

export default function AdminPortal() {
  return (
    <div>
      <p className="font-marginalia text-2xl text-red-pen -rotate-1">at a glance</p>
      <h1 className="font-display text-3xl font-semibold mb-8">Admin dashboard</h1>

      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="rounded-sm border border-rule-line bg-paper-raised p-5">
            <p className="font-display text-3xl font-semibold">{c.value}</p>
            <p className="text-sm font-medium text-ink mt-1">{c.label}</p>
            <p className="text-xs text-ink-soft mt-1">{c.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-sm border border-dashed border-rule-line p-6 text-sm text-ink-soft">
        This is a placeholder view. Phase 4 wires these numbers to the real
        billing and enquiry data (Razorpay + the /api/lead submissions
        currently just logged to the server console).
      </div>
    </div>
  );
}
