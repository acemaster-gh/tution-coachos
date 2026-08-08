"use client";

import { useState, useEffect, useCallback } from "react";
import { siteConfig } from "@/config/site";
import AnimatedSection from "./AnimatedSection";

const STARS = 5;

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #c1442d 0%, #e3714d 100%)",
  "linear-gradient(135deg, #e3b23c 0%, #f5cc70 100%)",
  "linear-gradient(135deg, #16a34a 0%, #4ade80 100%)",
  "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
];

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white"
      style={{
        background: AVATAR_GRADIENTS[idx],
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function StarRow() {
  return (
    <div className="flex gap-0.5" aria-label={`${STARS} out of 5 stars`}>
      {Array.from({ length: STARS }).map((_, s) => (
        <svg key={s} className="w-4 h-4 fill-current" viewBox="0 0 20 20" aria-hidden
          style={{ color: "#e3b23c", filter: "drop-shadow(0 1px 2px rgba(227,178,60,0.4))" }}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({
  t,
  featured = false,
}: {
  t: typeof siteConfig.testimonials[number];
  featured?: boolean;
}) {
  return (
    <figure
      className="relative flex flex-col gap-4 h-full rounded-2xl p-6 overflow-hidden"
      style={{
        background: featured
          ? "linear-gradient(145deg, var(--ink) 0%, #2d3e52 100%)"
          : "var(--paper-card)",
        border: featured ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(201,194,174,0.5)",
        boxShadow: featured
          ? "0 20px 60px rgba(27,36,48,0.2), 0 4px 16px rgba(27,36,48,0.1)"
          : "var(--shadow-sm)",
      }}
    >
      {/* Decorative large quote mark */}
      <span
        className="absolute top-3 right-4 font-display text-8xl leading-none select-none pointer-events-none"
        aria-hidden
        style={{
          color: featured ? "rgba(255,255,255,0.04)" : "rgba(193,68,45,0.06)",
          fontStyle: "italic",
        }}
      >
        &ldquo;
      </span>

      <StarRow />

      <blockquote
        className="relative flex-1 text-base leading-relaxed"
        style={{ color: featured ? "rgba(255,255,255,0.88)" : "var(--ink)" }}
      >
        <span className="block">&ldquo;{t.quote}&rdquo;</span>
      </blockquote>

      <figcaption
        className="flex items-center gap-3 pt-4"
        style={{ borderTop: featured ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--rule-faint)" }}
      >
        <div
          className="shrink-0"
          style={featured ? { filter: "drop-shadow(0 0 8px rgba(227,178,60,0.3))" } : {}}
        >
          <Avatar name={t.name} />
        </div>
        <div>
          <p
            className="font-semibold text-sm"
            style={{ color: featured ? "white" : "var(--ink)" }}
          >
            {t.name}
          </p>
          <p
            className="text-xs"
            style={{ color: featured ? "rgba(255,255,255,0.5)" : "var(--ink-muted)" }}
          >
            {t.role}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const items = siteConfig.testimonials;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const next = useCallback(() => setActive((p) => (p + 1) % items.length), [items.length]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <section id="results" className="border-b border-rule-line overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <AnimatedSection>
          <span className="section-label">what parents actually say</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-1 mb-4 max-w-2xl leading-tight">
            What the report card doesn&apos;t say,{" "}
            <span className="italic text-ink-soft">parents hear from us first.</span>
          </h2>
          <p className="text-ink-soft max-w-lg mb-12">
            Real feedback from parents and faculty across our batches.
          </p>
        </AnimatedSection>

        {/* Desktop: 3-col grid with featured center */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 items-start">
          {items.map((t, i) => (
            <AnimatedSection key={t.name} delay={i * 150}>
              <TestimonialCard t={t} featured={i === 1} />
            </AnimatedSection>
          ))}
        </div>

        {/* Mobile carousel */}
        <div
          className="md:hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatedSection>
            <TestimonialCard t={items[active]} featured />
            <div className="flex justify-center gap-2 mt-5">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`carousel-dot ${i === active ? "active" : ""}`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={300} className="mt-14 text-center">
          <p className="font-marginalia text-2xl text-red-pen -rotate-1 mb-3">join them</p>
          <a href="#enquire" className="btn-primary inline-flex">
            Book a free trial class →
          </a>
        </AnimatedSection>
      </div>
    </section>
  );
}
