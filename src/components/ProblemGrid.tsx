const items = [
  {
    tag: "Retention",
    problem: "Parents find out about a slipping grade only at report-card time.",
    fix: "Automatic flag when a student's score drops across three tests in a row — tutors reach out before the parent decides to leave.",
  },
  {
    tag: "Fee collection",
    problem: "Chasing late fees every month eats a founder's Sunday.",
    fix: "WhatsApp and email reminders go out on their own, with monthly auto-debit and instalment plans for parents who need them.",
  },
  {
    tag: "Local visibility",
    problem: "Big ed-tech chains outrank the local institute that actually knows the kids.",
    fix: "The site is built to win searches like “Class 10 tutor near me,” with real results and video testimonials doing the convincing.",
  },
  {
    tag: "Tutor dependency",
    problem: "One senior tutor leaves, and a batch loses a term of momentum.",
    fix: "Notes, revision recordings, and practice sets live on the institute's own portal — a sub-tutor can step in without the batch losing a week.",
  },
  {
    tag: "Admin load",
    problem: "Inquiries, printing, and scheduling swallow the founder's week.",
    fix: "A structured enquiry form captures grade and subject automatically; study material goes out as a portal login, not a photocopy queue.",
  },
];

export default function ProblemGrid() {
  return (
    <section id="how-it-works" className="border-b border-rule-line">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="font-marginalia text-2xl text-red-pen -rotate-1">what actually eats a founder's week</p>
        <h2 className="font-display text-3xl md:text-4xl font-semibold mt-1 mb-10 max-w-xl">
          Five problems the portal solves before they become a withdrawal.
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.tag}
              className="rounded-sm border border-rule-line bg-paper-raised p-6"
            >
              <span className="inline-block text-xs font-semibold uppercase tracking-wide text-red-pen border border-red-pen/40 rounded-sm px-2 py-1 mb-3">
                {item.tag}
              </span>
              <p className="text-ink-soft line-through decoration-red-pen/60 decoration-2">
                {item.problem}
              </p>
              <p className="font-medium text-ink mt-2">{item.fix}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
