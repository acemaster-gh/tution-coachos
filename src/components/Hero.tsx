import { siteConfig } from "@/config/site";
import DashboardPreview from "./DashboardPreview";
import AnimatedSection from "./AnimatedSection";

const TRUST_ITEMS = [
  { icon: "📊", label: "Live score tracking" },
  { icon: "🔔", label: "Automatic parent alerts" },
  { icon: "💳", label: "Online fee payment" },
  { icon: "📚", label: "Notes & video portal" },
  { icon: "👥", label: "Small batch sizes" },
  { icon: "📱", label: "Mobile-friendly portal" },
  { icon: "⚡", label: "3-test dip detection" },
  { icon: "🎯", label: "JEE / NEET foundation" },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-rule-line"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 15% 0%, rgba(193,68,45,0.13) 0%, transparent 55%), " +
          "radial-gradient(ellipse 60% 50% at 85% 90%, rgba(227,178,60,0.11) 0%, transparent 55%), " +
          "radial-gradient(ellipse 50% 40% at 55% 40%, rgba(37,99,235,0.06) 0%, transparent 55%), " +
          "var(--paper)",
      }}
    >
      {/* Gradient orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />

      {/* Ruled-paper background */}
      <div className="absolute inset-0 ruled-bg opacity-25" />

      {/* Main content */}
      <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-10 md:pt-24 md:pb-14 grid md:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 items-center">

        {/* ── Left: copy ─────────────────────────────────────── */}
        <div>
          {/* Eyebrow badge */}
          <div className="animate-fade-in-up mb-5">
            <span className="hero-badge">
              <span className="hero-badge-icon">📍</span>
              {siteConfig.city} · Coaching Centre
            </span>
          </div>

          {/* H1 */}
          <h1 className="font-display leading-[1.1] text-ink animate-fade-in-up delay-100">
            <span className="block text-[2.4rem] md:text-[3rem] lg:text-[3.6rem] font-light italic text-ink-soft mb-1">
              Where a dropping grade
            </span>
            <span
              className="block text-[2.6rem] md:text-[3.2rem] lg:text-[3.8rem] font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, var(--red-pen) 0%, #d4543c 40%, var(--highlighter) 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradientShift 5s ease infinite",
              }}
            >
              gets caught in week two.
            </span>
          </h1>

          <p className="mt-5 text-[1.05rem] text-ink-soft max-w-lg leading-relaxed animate-fade-in-up delay-200">
            {siteConfig.instituteName} tracks every test, every absence, and every
            slipping grade — and tells you about it{" "}
            <span className="font-semibold text-ink relative inline-block">
              before the parent has to ask.
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                style={{ background: "linear-gradient(90deg, var(--highlighter), rgba(227,178,60,0))" }}
              />
            </span>
          </p>

          {/* Subject pills */}
          <div className="flex flex-wrap gap-2 mt-6 animate-fade-in-up delay-300">
            {siteConfig.subjects.map((s) => (
              <span
                key={s}
                className="text-xs font-medium px-3 py-1.5 rounded-full border text-ink-soft"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  borderColor: "rgba(201,194,174,0.6)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {s}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-up delay-400">
            <a href="#enquire" className="btn-primary text-base">
              Book a free trial class
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-base"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-green flex-shrink-0" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.551 4.105 1.515 5.83L.057 23.428a.5.5 0 0 0 .612.61l5.676-1.484A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.953 9.953 0 0 1-5.13-1.42l-.37-.22-3.37.882.9-3.28-.24-.38A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              WhatsApp us
            </a>
          </div>

          {/* Trust signal */}
          <div className="mt-8 flex items-center gap-4 animate-fade-in-up delay-500">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green" />
              </span>
              <span className="text-sm text-ink-soft font-medium">Free 2-week trial</span>
            </div>
            <span className="w-px h-4 bg-rule-line" />
            <span className="text-sm text-ink-soft">No commitment</span>
            <span className="w-px h-4 bg-rule-line" />
            <span className="text-sm text-ink-soft">200+ families</span>
          </div>
        </div>

        {/* ── Right: dashboard mockup ─────────────────────────── */}
        <div className="flex justify-center md:justify-end animate-fade-in-up delay-300">
          <div className="relative">
            {/* Floating annotation — above */}
            <div
              className="absolute -top-8 -left-2 z-10 animate-bounce-subtle hidden lg:block"
              style={{ animationDuration: "3s" }}
            >
              <span
                className="font-marginalia text-lg text-red-pen"
                style={{ transform: "rotate(-8deg)", display: "block" }}
              >
                caught in week two ↓
              </span>
            </div>

            {/* Glow halo behind the card */}
            <div
              className="absolute inset-0 rounded-2xl -z-10"
              style={{
                filter: "blur(40px)",
                background:
                  "radial-gradient(ellipse at center, rgba(193,68,45,0.18) 0%, rgba(227,178,60,0.12) 50%, transparent 80%)",
                transform: "scale(1.15)",
              }}
            />

            {/* Floating card wrapper */}
            <div
              className="animate-float"
              style={{ animationDuration: "6s" }}
            >
              <DashboardPreview />
            </div>

            {/* Bottom annotation */}
            <span
              className="absolute -bottom-6 right-0 font-marginalia text-sm text-ink-soft select-none hidden sm:block"
              style={{ transform: "rotate(3deg)" }}
            >
              this is the moment a parent decides to stay
            </span>
          </div>
        </div>
      </div>

      {/* ── Trust marquee strip ───────────────────────────────── */}
      <div
        className="border-t border-rule-faint py-3.5"
        style={{ background: "rgba(255,255,255,0.45)", backdropFilter: "blur(8px)" }}
      >
        <div className="marquee-strip">
          <div className="marquee-inner">
            {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
              <span
                key={`${item.label}-${i}`}
                className="flex items-center gap-1.5 text-sm text-ink-soft font-medium whitespace-nowrap"
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
                <span className="text-rule-line ml-2">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll chevron ────────────────────────────────────── */}
      <div className="flex justify-center py-5 animate-bounce-subtle" style={{ animationDuration: "2s" }}>
        <a
          href="#how-it-works"
          aria-label="Scroll to features"
          className="flex flex-col items-center gap-1 text-ink-muted hover:text-ink-soft transition-colors"
        >
          <span className="text-xs font-medium tracking-wider uppercase" style={{ fontSize: "0.6rem" }}>Explore</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
