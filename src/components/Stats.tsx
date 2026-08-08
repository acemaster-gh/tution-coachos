"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import AnimatedSection from "./AnimatedSection";

const ICONS = ["📈", "⚡", "🕐"];
const ACCENTS = ["accent-red", "accent-amber", "accent-green"] as const;
const ICON_LABELS = ["Growth", "Speed", "Time saved"];

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          function step(now: number) {
            const progress = Math.min((now - startTime) / duration, 1);
            // Expo ease out
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
          }
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatItem({
  value,
  label,
  icon,
  accent,
  index,
}: {
  value: string;
  label: string;
  icon: string;
  accent: string;
  index: number;
}) {
  const numMatch = value.match(/[\d.]+/);
  const numPart = numMatch ? parseFloat(numMatch[0]) : 0;
  const isDecimal = numMatch ? numMatch[0].includes(".") : false;
  const prefix = value.slice(0, numMatch?.index ?? 0);
  const suffix = numMatch ? value.slice((numMatch.index ?? 0) + numMatch[0].length) : value;

  const animTarget = isDecimal ? Math.round(numPart * 10) : numPart;
  const { count, ref } = useCountUp(animTarget);
  const displayNum = isDecimal ? (count / 10).toFixed(1) : count;

  const glowColor =
    accent === "accent-red"   ? "rgba(193,68,45,0.15)" :
    accent === "accent-amber" ? "rgba(227,178,60,0.2)" :
    "rgba(22,163,74,0.15)";

  const gradColor =
    accent === "accent-red"   ? "linear-gradient(135deg, var(--red-pen), var(--highlighter))" :
    accent === "accent-amber" ? "linear-gradient(135deg, var(--highlighter), var(--amber))" :
    "linear-gradient(135deg, var(--green), #34d399)";

  return (
    <AnimatedSection delay={index * 150}>
      <div
        ref={ref}
        className={`stat-card ${accent} group cursor-default`}
        data-icon={icon}
        style={{ transition: "box-shadow 0.35s, transform 0.35s" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            `0 12px 40px ${glowColor}, 0 4px 16px rgba(27,36,48,0.08)`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "";
        }}
      >
        {/* Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: `${glowColor.replace("0.15", "0.12").replace("0.2", "0.15")}` }}
          >
            {icon}
          </div>
        </div>

        {/* Number */}
        <p className="font-display text-[2.75rem] leading-none font-bold tracking-tight">
          <span
            style={{
              background: gradColor,
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradientShift 4s ease infinite",
            }}
          >
            {prefix}
            {numMatch ? displayNum : value}
            {suffix}
          </span>
        </p>

        {/* Label */}
        <p className="text-sm text-ink-soft mt-2 leading-snug">{label}</p>

        {/* Bottom gradient bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: gradColor }}
        />
      </div>
    </AnimatedSection>
  );
}

export default function Stats() {
  return (
    <section
      className="border-b border-rule-line"
      style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)" }}
    >
      <div className="mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {siteConfig.stats.map((s, i) => (
          <StatItem
            key={s.label}
            value={s.value}
            label={s.label}
            icon={ICONS[i]}
            accent={ACCENTS[i % ACCENTS.length]}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
