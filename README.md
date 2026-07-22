# CoachOS

A resellable web platform for coaching centres / tutoring institutes, built
around the five problems that actually cost these businesses students and
founder-hours: retention (no data on who's slipping), fee collection,
local visibility vs. big ed-tech chains, tutor dependency, and admin load.

**The pitch to a client is this landing page itself** — it's the demo you show
a coaching-centre owner. Swap `src/config/site.ts` with their details before
the meeting and it becomes *their* site.

## Status: Phase 1 of 6 complete

- [x] **Phase 0** — project scaffold, design system, git repo
- [x] **Phase 1** — marketing site / digital storefront (this is what's built)
- [x] **Phase 2** — auth + role-based portal shell (admin / tutor / parent)
- [x] **Phase 3** — student dashboard & analytics (the real version of the hero mockup)
- [x] **Phase 4** — billing & fee automation (Razorpay)
- [ ] **Phase 5** — content library / LMS
- [ ] **Phase 6** — inquiry automation, multi-tenant polish, deploy

## Stack

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS v4
- Config-driven branding (`src/config/site.ts` — the one file you edit per client)

## Reselling this to a new client

1. Duplicate this repo (or branch it) per client.
2. Edit **only** `src/config/site.ts`: name, tagline, city, subjects, contact
   info, colors, stats, testimonials.
3. Restore real fonts per `FONTS.md` (only needed because this sandbox
   blocks external font fetches — not an issue on your machine or Vercel).
4. `npm run dev` to preview, `npm run build && vercel deploy` to ship.
5. As Phases 2-6 land, each client repo gets the portal, billing, and LMS
   for free by pulling the latest from `main`.

## Phase 3: real data & the alert rule

`data/students.json` now holds real test scores and attendance. Two
distinct rules live in `src/lib/students.ts`:

- `isCurrentlyDipping` — only the **trailing three tests**; this drives the
  live "needs attention" flag, so a student who recovered goes back to
  "on track" instead of staying flagged forever.
- `hasThreeTestDip` — any three-test dip in the *whole* history; used only
  for the illustrative chart annotation (the hero graphic and the parent
  dashboard), where showing "here's the dip we caught" is still useful
  even after it's resolved.

Demo data deliberately covers all three cases: Aarav and Kabir already
recovered (on track), Ishaan is flagged on attendance, Sana is flagged
mid-dip (the scenario the whole product is pitched on).

## Phase 4: fees & payments

`data/fees.json` holds fee records; `src/lib/fees.ts` computes overdue/
pending totals and which fees need a reminder. Three pieces:

- **Parent-facing payment** — `/api/billing/create-order` creates a real
  Razorpay order; `PayFeeButton` opens Razorpay's checkout widget. Without
  `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` set, it fails with a clear
  message instead of crashing — set test-mode keys in `.env.local` to try
  it live (get them free at dashboard.razorpay.com after signup).
- **Admin visibility** — the admin dashboard shows real overdue totals and
  flagged-student counts, computed live from the JSON data.
- **Reminders** — `node scripts/send-reminders.js` logs who's due/overdue
  for a fee (stand-in for an actual WhatsApp/email send). Schedule this as
  a daily cron once deployed; Phase 6 wires in the real send.

## Phase 2: auth & portal

Three roles, each gated to their own area under `/portal`:

- `admin@ascentlearning.example` / `demo1234`
- `tutor@ascentlearning.example` / `demo1234`
- `parent@ascentlearning.example` / `demo1234`

Regenerate these anytime with `node scripts/seed.js`. Users live in
`data/users.json` for now (a JSON file standing in for a real database) —
Phase 4 swaps `src/lib/db.ts` for Postgres without touching auth, the
proxy, or any page.

Before deploying anywhere beyond your own machine: copy `.env.example` to
`.env.local` and set a real `SESSION_SECRET` (a long random string). Without
it, sessions sign with an insecure dev-only fallback.

## Local development

```bash
npm install
npm run dev       # http://localhost:3000
npm run build      # production build
```

## Where things live

```
src/
  config/site.ts        <- per-client branding, edit this per sale
  app/
    layout.tsx           <- fonts + metadata
    page.tsx              <- assembles the landing page
    api/lead/route.ts      <- enquiry form handler (Phase 4: wire to real DB)
  components/
    Nav.tsx, Hero.tsx, DashboardPreview.tsx, Stats.tsx,
    ProblemGrid.tsx, Testimonials.tsx, LeadForm.tsx, Footer.tsx
```

## Using Claude vs. Gemini on this project

- **Claude** - architecture, app code, data models, API/DB integrations,
  anything that needs multi-file consistency or debugging.
- **Gemini Pro** - marketing copy variants per client vertical (JEE prep vs.
  primary-school tutoring reads very differently), OG/social images,
  brainstorming pricing pitches for prospects.

Keep `src/config/site.ts` as the single source of truth either tool writes
into - that's what keeps the two from stepping on each other.
