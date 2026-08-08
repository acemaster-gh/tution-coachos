"use client";

import { siteConfig } from "@/config/site";

const QUICK_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#results",      label: "Results" },
  { href: "#pricing",      label: "Pricing" },
  { href: "#faq",          label: "FAQ" },
  { href: "#enquire",      label: "Book a trial" },
  { href: "/login",        label: "Portal login" },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto relative overflow-hidden">
      {/* Pre-footer CTA strip */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--ink) 0%, #2d3e52 60%, #1a2d1a 100%)",
        }}
      >
        {/* Orbs */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(193,68,45,0.3) 0%, transparent 70%)", filter: "blur(40px)" }}
        />
        <div
          className="absolute -bottom-10 left-20 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(227,178,60,0.2) 0%, transparent 70%)", filter: "blur(30px)" }}
        />

        <div className="relative mx-auto max-w-6xl px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="font-marginalia text-2xl text-highlighter -rotate-1 mb-2">
              ready to stop chasing?
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-white leading-tight max-w-md">
              Give your institute the OS it deserves.
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="#enquire"
              className="btn-primary text-base"
            >
              Book a free trial →
            </a>
            <a
              href={`tel:${siteConfig.phone}`}
              className="px-5 py-3 rounded text-sm font-medium text-white/80 hover:text-white transition-colors border border-white/15 hover:border-white/30"
            >
              {siteConfig.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main footer body */}
      <div
        className="relative"
        style={{ background: "#14202c", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Subtle ruled pattern */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 35px, rgba(255,255,255,1) 35px, rgba(255,255,255,1) 36px)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10">

            {/* Brand column */}
            <div className="md:col-span-1">
              <p className="font-display text-lg font-semibold text-white mb-3">
                {siteConfig.instituteName}
              </p>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
                The coaching-centre operating system — built so a dropping grade
                gets caught in week two, not report-card day.
              </p>
              {/* Social links */}
              <div className="flex items-center gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                    aria-label={s.label}
                    style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "white";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                      (e.currentTarget as HTMLElement).style.transform = "";
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Subjects column */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                We teach
              </p>
              <ul className="space-y-2.5">
                {siteConfig.subjects.map((s) => (
                  <li key={s} className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Links column */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                Quick links
              </p>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-sm transition-colors duration-150"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)")}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact column */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                Contact
              </p>
              <div className="space-y-3 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="flex items-center gap-2 transition-colors duration-150 hover:text-white"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {siteConfig.phone}
                </a>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-2 transition-colors duration-150 hover:text-white"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {siteConfig.email}
                </a>
                <a
                  href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors duration-150 hover:text-white"
                >
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.551 4.105 1.515 5.83L.057 23.428a.5.5 0 0 0 .612.61l5.676-1.484A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.953 9.953 0 0 1-5.13-1.42l-.37-.22-3.37.882.9-3.28-.24-.38A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  WhatsApp us
                </a>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {siteConfig.address}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" }}
          >
            <p>© {year} {siteConfig.instituteName}. All rights reserved.</p>
            <p>
              Powered by{" "}
              <span
                className="font-semibold"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                CoachOS
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
