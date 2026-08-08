"use client";

import { useState } from "react";
import AnimatedSection from "./AnimatedSection";

const FAQS = [
  {
    q: "Can my child take a free trial before enrolling?",
    a: "Absolutely. Every plan starts with a free 2-week trial — your child attends real classes with their batch, and you get full portal access to see their scores and attendance. No card required, no commitment.",
  },
  {
    q: "How do I track my child's progress?",
    a: "The moment you enrol, you get access to the parent portal. You'll see test scores after every session, attendance records, and automatic alerts if there's ever a three-test score dip. It's the same dashboard the tutors use — nothing is hidden behind a quarterly report card.",
  },
  {
    q: "What happens if a tutor leaves mid-term?",
    a: "All notes, recorded sessions, and practice sets live on the institute's portal — not on any one tutor's phone. A substitute tutor can pick up exactly where things left off, so your child's batch doesn't lose a single week of momentum.",
  },
  {
    q: "How are fees collected? Can I pay in instalments?",
    a: "We support UPI, bank transfer, and card payments through Razorpay. Monthly and quarterly plans are available, and automated WhatsApp reminders go out before due dates so you never miss one. No awkward phone calls.",
  },
  {
    q: "What subjects and grades do you cover?",
    a: "We currently offer Class 8–12 Mathematics, Science (Physics, Chemistry, Biology), and JEE/NEET Foundation courses. Batches are kept small (max 15 students) to ensure personal attention.",
  },
  {
    q: "What are the batch timings?",
    a: "We run morning (7–9 AM), afternoon (3–5 PM), and evening (6–8 PM) batches on weekdays. Weekend batches are available for competitive exam prep. You can switch batches once per quarter if your schedule changes.",
  },
  {
    q: "Is the portal available on mobile?",
    a: "Yes — the portal is fully responsive and works on any phone, tablet, or laptop browser. There's no separate app to install. You can check scores, pay fees, and browse study material right from your phone.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <section id="faq" className="border-b border-rule-line">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <AnimatedSection>
          <span className="section-label">common questions</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-1 mb-4 leading-tight">
            Everything parents ask before enrolling.
          </h2>
          <p className="text-ink-soft max-w-lg mb-12">
            Can&apos;t find your answer? WhatsApp us — we reply within the hour.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--paper-card)",
              border: "1px solid rgba(201,194,174,0.5)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {FAQS.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className="faq-item"
                  style={{
                    background: isOpen ? "rgba(193,68,45,0.025)" : "transparent",
                    transition: "background 0.3s",
                  }}
                >
                  <button
                    type="button"
                    className="faq-trigger px-6"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${i}`}
                    id={`faq-trigger-${i}`}
                  >
                    <span className="flex-1 text-left">{faq.q}</span>
                    {/* +/× icon */}
                    <div className="faq-icon">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        {isOpen ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        )}
                      </svg>
                    </div>
                  </button>
                  <div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    className={`faq-answer ${isOpen ? "open" : ""}`}
                  >
                    <p className="text-sm text-ink-soft leading-relaxed px-6 pb-2">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200} className="mt-10 text-center">
          <p className="text-ink-soft text-sm mb-5">
            Still have questions? We&apos;re a WhatsApp message away.
          </p>
          <a href="#enquire" className="btn-primary inline-flex">
            Book a free trial class →
          </a>
        </AnimatedSection>
      </div>
    </section>
  );
}
