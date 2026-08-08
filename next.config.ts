import type { NextConfig } from "next";

const securityHeaders = [
  // ── HSTS — force HTTPS for 2 years + subdomains ───────────────────
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // ── Prevent clickjacking ──────────────────────────────────────────
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // ── Prevent MIME-type sniffing ────────────────────────────────────
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // ── Control referrer leakage ──────────────────────────────────────
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // ── Restrict browser features ─────────────────────────────────────
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // ── DNS prefetch for external resources ───────────────────────────
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  // ── Content Security Policy ───────────────────────────────────────
  // Notes on necessary permissiveness:
  //   - 'unsafe-inline' for scripts: Next.js injects inline scripts in
  //     dev mode, and the Razorpay checkout SDK does the same in prod.
  //   - 'unsafe-eval' for scripts: Next.js dev server uses eval() for
  //     Fast Refresh. Can be removed in a production-only CSP if you
  //     serve a different header per environment.
  //   - fonts.googleapis.com / fonts.gstatic.com: Google Fonts loaded
  //     via @import in globals.css.
  //   - checkout.razorpay.com / api.razorpay.com: payment SDK.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://api.razorpay.com https://lux.razorpay.com",
      "frame-src https://api.razorpay.com https://checkout.razorpay.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to every route
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
