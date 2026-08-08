"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";

function BrandPanel() {
  return (
    <div
      className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #1b2430 0%, #0f1820 60%, #1a1508 100%)",
      }}
    >
      {/* Gradient orbs */}
      <div
        className="absolute -top-20 -right-16 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(193,68,45,0.35) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "orbFloat1 14s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-0 -left-16 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(227,178,60,0.25) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "orbFloat2 10s ease-in-out infinite",
        }}
      />

      {/* Ruled lines decoration */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 35px, #fff 35px, #fff 36px)",
        }}
      />

      {/* Floating mockup card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div
          className="w-72 rounded-2xl p-5 -rotate-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
            animation: "floatY 6s ease-in-out infinite",
          }}
          aria-hidden
        >
          {/* Card header */}
          <div
            className="flex items-center justify-between pb-3 mb-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                Progress Report
              </p>
              <p className="font-display text-sm font-semibold text-white">Sana Mirza — Chemistry</p>
            </div>
            <span className="font-marginalia text-xl rotate-[-6deg]" style={{ color: "#e3b23c" }}>
              week 4
            </span>
          </div>

          {/* Mini sparkline */}
          <svg viewBox="0 0 200 65" className="w-full h-14 mb-3">
            <defs>
              <linearGradient id="lgLogin" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                <stop offset="50%" stopColor="#c1442d" />
                <stop offset="100%" stopColor="#e3b23c" />
              </linearGradient>
              <linearGradient id="lgAreaLogin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <line x1="0" y1="42" x2="200" y2="42" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1="0" y1="22" x2="200" y2="22" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <polygon points="0,15 50,18 100,42 150,47 200,37 200,65 0,65" fill="url(#lgAreaLogin)" />
            <polyline
              points="0,15 50,18 100,42 150,47 200,37"
              fill="none"
              stroke="url(#lgLogin)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="100" cy="42" r="5" fill="rgba(193,68,45,0.9)" />
            <ellipse cx="100" cy="42" rx="20" ry="13" fill="none" stroke="#c1442d" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="200" cy="37" r="4" fill="#e3b23c" style={{ filter: "drop-shadow(0 0 4px rgba(227,178,60,0.8))" }} />
          </svg>

          <div
            className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-lg"
            style={{ background: "rgba(193,68,45,0.15)", border: "1px solid rgba(193,68,45,0.3)" }}
          >
            <span className="text-xs" style={{ color: "#c1442d" }}>⚠</span>
            <p className="font-marginalia text-sm rotate-[-0.5deg]" style={{ color: "#c1442d" }}>
              alert sent — score dip detected
            </p>
          </div>

          <div
            className="flex justify-between pt-2.5 text-[10px]"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}
          >
            <span>Attendance: 88%</span>
            <span className="text-green font-semibold" style={{ color: "#34d399" }}>Fee: paid ✓</span>
          </div>
        </div>
      </div>

      {/* Top brand */}
      <div className="relative z-10">
        <p
          className="font-display text-xl font-semibold"
          style={{
            background: "linear-gradient(135deg, white 0%, rgba(255,255,255,0.7) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {siteConfig.instituteName}
        </p>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Staff &amp; Parent Portal
        </p>
      </div>

      {/* Bottom tagline */}
      <div className="relative z-10">
        <p
          className="font-marginalia text-2xl -rotate-1 mb-3"
          style={{ color: "#e3b23c" }}
        >
          the OS for serious institutes
        </p>
        <p
          className="font-display text-[1.6rem] font-semibold italic leading-tight max-w-xs"
          style={{ color: "rgba(255,255,255,0.88)" }}
        >
          {siteConfig.tagline}
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-1.5 mt-6 text-sm transition-colors duration-200"
          style={{ color: "rgba(255,255,255,0.35)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)")}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to site
        </a>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/portal";

  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Couldn't sign in.");
      router.push(next.startsWith("/portal") && next !== "/portal" ? next : `/portal/${body.role}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div
      className="flex flex-col justify-center px-8 sm:px-12 py-16 min-h-screen md:min-h-0"
      style={{ background: "var(--paper)" }}
    >
      {/* Mobile brand header */}
      <div className="md:hidden mb-8">
        <p className="font-display text-xl font-semibold text-ink">
          {siteConfig.instituteName}
        </p>
        <p className="text-sm text-ink-muted">Staff &amp; Parent Portal</p>
      </div>

      <div className="w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="section-label">welcome back</span>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink mt-1">
            Sign in to your portal
          </h1>
          <p className="text-ink-soft text-sm mt-2">
            Enter your credentials to access your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-soft mb-1.5">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="you@example.com"
              className="input-field"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink-soft mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {status === "error" && (
            <div
              className="flex items-start gap-2.5 text-sm p-3 rounded-lg animate-scale-in"
              role="alert"
              style={{
                color: "var(--red-pen)",
                background: "var(--red-pen-bg)",
                border: "1px solid rgba(193,68,45,0.2)",
              }}
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errorMessage}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            id="login-submit"
            disabled={status === "submitting"}
            className="btn-primary w-full text-base disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ marginTop: "0.5rem" }}
          >
            {status === "submitting" ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Demo accounts */}
        {siteConfig.demoMode && (
          <div
            className="mt-6 rounded-xl p-4"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(201,194,174,0.5)",
              backdropFilter: "blur(8px)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-3">
              Demo accounts · password: <span className="font-mono">demo1234</span>
            </p>
            <div className="space-y-2">
              {[
                { role: "Admin",  email: "admin@ascentlearning.example",  badge: "badge-red" },
                { role: "Tutor",  email: "tutor@ascentlearning.example",  badge: "badge-amber" },
                { role: "Parent", email: "parent@ascentlearning.example", badge: "badge-green" },
              ].map((d) => (
                <div key={d.role} className="flex items-center gap-2 text-xs text-ink-soft">
                  <span className={`badge ${d.badge}`}>{d.role}</span>
                  <span className="font-mono text-ink-muted truncate">{d.email}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-ink-muted">
          <a href="/" className="hover:text-ink transition-colors inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to site
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[1.1fr_1fr]">
      <BrandPanel />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
