import AnimatedSection from "./AnimatedSection";

const items = [
  {
    tag:     "Retention",
    icon:    "📊",
    problem: "Parents find out about a slipping grade only at report-card time.",
    fix:     "Automatic flag when a student's score drops across three tests in a row — tutors reach out before the parent decides to leave.",
    accent:  "accent-red",
    gradFrom: "rgba(193,68,45,0.08)",
    gradBorder: "rgba(193,68,45,0.2)",
    checkColor: "var(--red-pen)",
  },
  {
    tag:     "Fee collection",
    icon:    "💳",
    problem: "Chasing late fees every month eats a founder's Sunday.",
    fix:     "WhatsApp and email reminders go out on their own, with monthly auto-debit and instalment plans for parents who need them.",
    accent:  "accent-amber",
    gradFrom: "rgba(227,178,60,0.08)",
    gradBorder: "rgba(217,119,6,0.2)",
    checkColor: "var(--amber)",
  },
  {
    tag:     "Local visibility",
    icon:    "🔍",
    problem: "Big ed-tech chains outrank the local institute that actually knows the kids.",
    fix:     "The site is built to win searches like \"Class 10 tutor near me,\" with real results and video testimonials doing the convincing.",
    accent:  "accent-blue",
    gradFrom: "rgba(37,99,235,0.07)",
    gradBorder: "rgba(37,99,235,0.2)",
    checkColor: "var(--blue)",
  },
  {
    tag:     "Tutor dependency",
    icon:    "📚",
    problem: "One senior tutor leaves, and a batch loses a term of momentum.",
    fix:     "Notes, revision recordings, and practice sets live on the institute's own portal — a sub-tutor can step in without the batch losing a week.",
    accent:  "accent-green",
    gradFrom: "rgba(22,163,74,0.07)",
    gradBorder: "rgba(22,163,74,0.2)",
    checkColor: "var(--green)",
  },
  {
    tag:     "Admin load",
    icon:    "⚙️",
    problem: "Inquiries, printing, and scheduling swallow the founder's week.",
    fix:     "A structured enquiry form captures grade and subject automatically; study material goes out as a portal login, not a photocopy queue.",
    accent:  "accent-amber",
    gradFrom: "rgba(227,178,60,0.08)",
    gradBorder: "rgba(217,119,6,0.2)",
    checkColor: "var(--amber)",
  },
];

export default function ProblemGrid() {
  return (
    <section id="how-it-works" className="border-b border-rule-line">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <AnimatedSection>
          <span className="section-label">what actually eats a founder&apos;s week</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-1 mb-4 max-w-xl leading-tight">
            Five problems the portal solves{" "}
            <span className="italic text-ink-soft">before they become a withdrawal.</span>
          </h2>
          <p className="text-ink-soft max-w-lg mb-12">
            Built from real coaching-centre pain points — every feature maps to money lost or time wasted.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-5">
          {items.map((item, i) => (
            <AnimatedSection key={item.tag} delay={i * 100}>
              <div
                className="feature-card group p-6 h-full rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${item.gradFrom} 0%, var(--paper-raised) 50%)`,
                  borderColor: item.gradBorder,
                  border: `1px solid ${item.gradBorder}`,
                }}
              >
                {/* Top row: icon + badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: item.gradFrom.replace("0.08", "0.15").replace("0.07", "0.12") }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: item.checkColor }}
                  >
                    {item.tag}
                  </span>
                </div>

                {/* Problem — struck through */}
                <div className="mb-3 flex items-start gap-2">
                  <span className="text-rule-line mt-0.5 text-sm font-bold shrink-0">✕</span>
                  <p className="text-ink-muted text-sm leading-relaxed line-through decoration-red-pen/40 decoration-1">
                    {item.problem}
                  </p>
                </div>

                {/* Fix */}
                <div className="flex items-start gap-2">
                  <span
                    className="mt-0.5 text-sm font-bold shrink-0"
                    style={{ color: item.checkColor }}
                  >
                    ✓
                  </span>
                  <p className="font-medium text-ink text-sm leading-relaxed">
                    {item.fix}
                  </p>
                </div>

                {/* Bottom glow line — appears on hover */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${item.checkColor}, transparent)` }}
                />
              </div>
            </AnimatedSection>
          ))}

          {/* Odd-item filler card */}
          {items.length % 2 === 1 && (
            <AnimatedSection delay={items.length * 100}>
              <div
                className="h-full rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 border"
                style={{
                  borderStyle: "dashed",
                  borderColor: "rgba(201,194,174,0.6)",
                  background: "rgba(255,255,255,0.3)",
                }}
              >
                <p className="font-marginalia text-2xl text-red-pen -rotate-1">
                  more coming
                </p>
                <p className="text-sm text-ink-soft max-w-xs">
                  New features ship monthly. Book a trial to see the live roadmap.
                </p>
                <a href="#enquire" className="btn-primary py-2.5 px-5 text-sm mt-1">
                  Book a trial →
                </a>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </section>
  );
}
