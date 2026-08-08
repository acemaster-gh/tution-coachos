"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";
import AnimatedSection from "./AnimatedSection";

const PLANS = [
  {
    name: "Foundation",
    description: "Perfect for Class 8–10 students starting their journey.",
    monthlyPrice: 3500,
    quarterlyPrice: 9000,
    icon: "🌱",
    accent: "blue",
    features: [
      "3 classes per week",
      "Weekly test & score tracking",
      "Parent progress reports",
      "WhatsApp attendance alerts",
      "Doubt-clearing sessions",
      "Access to notes portal",
    ],
  },
  {
    name: "Comprehensive",
    description: "Our most popular plan for serious Board + competitive exam prep.",
    monthlyPrice: 6000,
    quarterlyPrice: 15000,
    popular: true,
    icon: "🚀",
    accent: "red",
    features: [
      "5 classes per week",
      "Daily practice sets & tests",
      "1-on-1 tutor check-ins",
      "Real-time score dip alerts",
      "Video recordings of classes",
      "Full notes & revision library",
      "Priority doubt resolution",
      "Parent–tutor chat access",
    ],
  },
  {
    name: "Elite",
    description: "JEE / NEET foundation track with personal mentoring.",
    monthlyPrice: 9000,
    quarterlyPrice: 24000,
    icon: "⭐",
    accent: "amber",
    features: [
      "6 classes per week",
      "Personal academic mentor",
      "Mock test series (monthly)",
      "Performance analytics dashboard",
      "All Comprehensive features",
      "Career guidance sessions",
      "Holiday crash courses included",
      "Flexible batch switching",
    ],
  },
];

const CHECK_COLORS: Record<string, string> = {
  red:   "var(--red-pen)",
  amber: "var(--amber)",
  blue:  "var(--blue)",
  green: "var(--green)",
};

export default function Pricing() {
  const [isQuarterly, setIsQuarterly] = useState(false);

  return (
    <section id="pricing" className="border-b border-rule-line">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <AnimatedSection>
          <span className="section-label">transparent pricing</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-1 mb-4 max-w-2xl leading-tight">
            Plans that grow with your child&apos;s ambitions.
          </h2>
          <p className="text-ink-soft max-w-xl mb-10">
            Every plan includes the full {siteConfig.instituteName} portal — live progress tracking,
            automatic alerts, and direct tutor access. No hidden fees.
          </p>
        </AnimatedSection>

        {/* Toggle */}
        <AnimatedSection delay={100} className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-semibold transition-colors ${!isQuarterly ? "text-ink" : "text-ink-muted"}`}>
            Monthly
          </span>
          <button
            type="button"
            onClick={() => setIsQuarterly((v) => !v)}
            className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none"
            aria-label={`Switch to ${isQuarterly ? "monthly" : "quarterly"} pricing`}
            style={{
              background: isQuarterly
                ? "linear-gradient(135deg, var(--red-pen), var(--highlighter))"
                : "rgba(201,194,174,0.5)",
              boxShadow: isQuarterly ? "0 2px 12px rgba(193,68,45,0.3)" : "",
            }}
          >
            <span
              className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300"
              style={{
                left: isQuarterly ? "calc(100% - 1.625rem)" : "0.125rem",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }}
            />
          </button>
          <span className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${isQuarterly ? "text-ink" : "text-ink-muted"}`}>
            Quarterly
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "var(--green-bg)", color: "var(--green)", border: "1px solid rgba(22,163,74,0.2)" }}
            >
              Save 15%
            </span>
          </span>
        </AnimatedSection>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {PLANS.map((plan, i) => (
            <AnimatedSection key={plan.name} delay={i * 120}>
              <div
                className={`pricing-card h-full flex flex-col ${plan.popular ? "popular" : ""}`}
              >
                {plan.popular && (
                  <span className="popular-badge">⭐ Most popular</span>
                )}

                {/* Plan header */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{
                      background: plan.popular
                        ? "linear-gradient(135deg, var(--red-pen-bg), rgba(227,178,60,0.12))"
                        : "rgba(201,194,174,0.2)",
                    }}
                  >
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-ink-muted leading-snug">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--rule-faint)" }}>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="font-display text-[2.5rem] font-bold leading-none"
                      style={{ color: plan.popular ? "var(--red-pen)" : "var(--ink)" }}
                    >
                      ₹{(isQuarterly ? plan.quarterlyPrice : plan.monthlyPrice).toLocaleString("en-IN")}
                    </span>
                    <span className="text-ink-muted text-sm">
                      /{isQuarterly ? "quarter" : "month"}
                    </span>
                  </div>
                  {isQuarterly && (
                    <p className="text-xs mt-1 font-medium" style={{ color: "var(--green)" }}>
                      ₹{(plan.monthlyPrice * 3 - plan.quarterlyPrice).toLocaleString("en-IN")} saved vs monthly
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink-soft">
                      <svg
                        className="w-4 h-4 shrink-0 mt-0.5"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        style={{ color: CHECK_COLORS[plan.accent] ?? "var(--green)" }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#enquire"
                  className={plan.popular ? "btn-primary w-full text-center" : "btn-outline w-full text-center"}
                >
                  {plan.popular ? "Get started →" : "Book a trial"}
                </a>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Social proof */}
        <AnimatedSection delay={300} className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: "rgba(22,163,74,0.07)", border: "1px solid rgba(22,163,74,0.2)" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
            </span>
            <p className="text-sm text-ink-soft">
              Trusted by <strong className="text-ink">200+ families</strong> across {siteConfig.city} · Free 2-week trial on all plans
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
