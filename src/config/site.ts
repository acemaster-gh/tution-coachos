// ─────────────────────────────────────────────────────────────
// PER-CLIENT CONFIG
// This is the ONE file you edit when you resell CoachOS to a new
// coaching center. Everything else in the codebase reads from here.
// Swap this file (or load it from a DB per subdomain later for
// true multi-tenant) and the whole site rebrands.
// ─────────────────────────────────────────────────────────────

export const siteConfig = {
  // ── Flip this to false before selling to a client ──
  // When true, the login page shows demo credentials.
  demoMode: true,

  // Identity
  instituteName: "Ascent Learning Centre",
  tagline: "Where a dropping grade gets caught in week two, not report-card day.",
  city: "Gurugram",
  subjects: ["Class 9–10 Math & Science", "Class 11–12 Physics, Chem, Bio", "JEE / NEET Foundation"],

  // Contact
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  email: "admissions@ascentlearning.example",
  address: "2nd Floor, DLF Phase 3, Gurugram, Haryana",

  // Brand palette — see DESIGN.md for the reasoning
  colors: {
    paper: "#F3EFE6",        // ruled-notebook paper
    ink: "#1B2430",          // chalkboard ink / near-black blue
    inkSoft: "#3C4759",
    redPen: "#C1442D",       // teacher's red pen — corrections, alerts, CTA
    highlighter: "#E3B23C",  // mustard highlighter — progress, wins
    line: "#C9C2AE",         // faint rule lines
  },

  // Social proof (swap per client — pull from real testimonials before launch)
  stats: [
    { value: "94%", label: "students who stayed enrolled past 6 months" },
    { value: "3.2x", label: "faster tutor response to a slipping grade" },
    { value: "11 hrs", label: "admin time saved per week" },
  ],

  testimonials: [
    {
      quote: "We knew Aarav was struggling in Chemistry before his own report card told us.",
      name: "Priya Sharma",
      role: "Parent, Class 10",
    },
    {
      quote: "Fee reminders used to be my Sunday job. Now they just happen.",
      name: "Rajesh Kumar",
      role: "Founder, Ascent Learning Centre",
    },
    {
      quote: "The notes portal means a sub-tutor can step in without the batch losing a week.",
      name: "Meena Iyer",
      role: "Senior Faculty",
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
