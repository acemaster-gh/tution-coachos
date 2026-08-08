"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  /** Use 'reveal' for translateY or 'reveal-scale' for scale effect */
  variant?: "reveal" | "reveal-scale";
  /** Extra delay in ms before triggering */
  delay?: number;
  /** IntersectionObserver threshold (0-1) */
  threshold?: number;
}

export default function AnimatedSection({
  children,
  className = "",
  variant = "reveal",
  delay = 0,
  threshold = 0.15,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect user's motion preferences
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("revealed");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => {
            el.classList.add("revealed");
          }, delay);
          observer.unobserve(el);
          return () => clearTimeout(timer);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div ref={ref} className={`${variant} ${className}`}>
      {children}
    </div>
  );
}
