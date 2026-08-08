"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/config/site";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Track active section
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveHash(`#${e.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const links = [
    { href: "#how-it-works", label: "How it works" },
    { href: "#results",      label: "Results" },
    { href: "#pricing",      label: "Pricing" },
    { href: "#faq",          label: "FAQ" },
    { href: "#enquire",      label: "Enquire" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-400 ${
        scrolled
          ? "shadow-sm"
          : ""
      }`}
      style={{
        background: scrolled
          ? "rgba(243,239,230,0.92)"
          : "rgba(243,239,230,0.75)",
        backdropFilter: scrolled ? "blur(20px) saturate(1.5)" : "blur(10px)",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.5)" : "blur(10px)",
        borderBottom: scrolled ? "1px solid rgba(201,194,174,0.6)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">

        {/* Logo */}
        <a
          href="#top"
          className="font-display text-xl font-semibold tracking-tight shrink-0 transition-all duration-200 hover:opacity-80"
          style={{
            background: "linear-gradient(135deg, var(--ink) 0%, var(--ink-soft) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {siteConfig.instituteName}
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const isActive = activeHash === l.href;
            return (
              <a
                key={l.href}
                href={l.href}
                className="relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full"
                style={{
                  color: isActive ? "var(--ink)" : "var(--ink-soft)",
                  background: isActive ? "rgba(201,194,174,0.25)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(201,194,174,0.15)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {l.label}
                {isActive && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-pen"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <a
            href="/login"
            className="text-sm font-medium text-ink-soft hover:text-ink transition-colors px-3 py-2 rounded-full hover:bg-rule-faint"
          >
            Portal login →
          </a>
          <a
            href={`tel:${siteConfig.phone}`}
            className="btn-primary py-2.5 px-5 text-sm"
          >
            {siteConfig.phone}
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200"
          style={{
            background: menuOpen ? "rgba(201,194,174,0.35)" : "transparent",
          }}
        >
          <span className="sr-only">{menuOpen ? "Close" : "Menu"}</span>
          <div className="w-5 h-4 flex flex-col justify-between">
            <span
              className="block h-0.5 bg-ink rounded-full transition-all duration-300 origin-center"
              style={{
                transform: menuOpen ? "translateY(7.5px) rotate(45deg)" : "",
              }}
            />
            <span
              className="block h-0.5 bg-ink rounded-full transition-all duration-300"
              style={{ opacity: menuOpen ? 0 : 1, transform: menuOpen ? "scaleX(0)" : "" }}
            />
            <span
              className="block h-0.5 bg-ink rounded-full transition-all duration-300 origin-center"
              style={{
                transform: menuOpen ? "translateY(-7.5px) rotate(-45deg)" : "",
              }}
            />
          </div>
        </button>
      </div>

      {/* Mobile backdrop */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 top-[65px] bg-ink/25 backdrop-blur-sm z-40"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="md:hidden fixed left-0 right-0 top-[65px] z-50 border-t border-rule-line animate-slide-down overflow-hidden"
          style={{
            background: "rgba(243,239,230,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-ink-soft hover:text-ink rounded-lg transition-all duration-150"
                style={{ background: activeHash === l.href ? "rgba(193,68,45,0.07)" : "" }}
              >
                {l.label}
              </a>
            ))}
            <div className="my-2 h-px bg-rule-faint" />
            <a
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 text-sm font-medium text-ink-soft hover:text-ink rounded-lg transition-all duration-150 hover:bg-rule-faint"
            >
              Portal login →
            </a>
            <a
              href={`tel:${siteConfig.phone}`}
              className="btn-primary mt-2 text-sm"
            >
              Call {siteConfig.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
