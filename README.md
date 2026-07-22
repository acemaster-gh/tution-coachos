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
- [x] **Phase 5** — content library / LMS
- [x] **Phase 6** — inquiry automation, real notifications, multi-tenant polish
- [x] **Phase 7** — data entry (attendance/scores), lead enrollment, notification audit

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

## Phase 7: data entry, enrollment, and audit

Three real gaps closed after actually testing the app end to end:

- **Attendance/score data entry** — previously all student data was seed
  data with no way to add to it. Tutors now click into a student
  (`/portal/tutor/student/[id]`) to mark today's attendance or record a
  test score. Both trigger an immediate alert re-check, so a newly-added
  low score or absence can flag a student right away.
- **Lead → enrolled student** — the biggest gap: admin could see a website
  enquiry but had no way to turn it into an actual student + parent
  portal account. `/api/admin/enroll` creates both in one step, assigns a
  tutor, and generates a temporary password for the admin to relay to the
  parent. Rejects duplicate emails.
- **Notification audit log** — `/portal/admin/notifications` shows every
  message sent (or logged, if providers aren't configured), so an admin
  isn't limited to `data/notifications.json` in a text editor.

**Keeping demo data clean**: `node scripts/reset-demo-data.js` restores
`students.json`/`fees.json`/`resources.json` from `data/seed/` (the
canonical snapshots), regenerates `users.json`, and empties
`leads.json`/`notifications.json`/`alert-state.json`. Run this before a
demo or before committing — testing generates real data (leads, scores,
enrolled students) that shouldn't ship as if it were the seed set.

## Phase 5: content library

`/portal/library` — tutors and admins can add notes/videos/practice sets
(`src/lib/resources.ts`, `data/resources.json`). Parents see a read-only
view automatically filtered to their child's grade. This is the
tutor-independence piece from the pitch: material lives on the institute's
own portal, not with one person.

## Phase 6: real notifications

`src/lib/notifications.ts` is a provider-agnostic send layer — email via
Resend, WhatsApp/SMS via Twilio — that **logs instead of failing** when
the relevant env vars aren't set, so nothing breaks without real API
keys. Every send attempt (real or logged) is recorded to
`data/notifications.json` for an audit trail.

`src/lib/messaging.ts` has the three templated triggers the product is
actually pitched on:
- **New enquiry** → emails/WhatsApps the admin (wired into `/api/lead`)
- **Fee due/overdue** → emails/WhatsApps the parent (wired into
  `/api/billing/reminders`)
- **Student flagged** (score dip or attendance) → emails/WhatsApps both
  parent and tutor (wired into `/api/alerts/check`)

The alert check is deduped — `src/lib/alerts.ts` only notifies on a *new*
flag, not every time someone loads a page, and correctly retries (instead
of silently giving up) if a student's parent/tutor record is missing.

**To go live**: set `RESEND_API_KEY`/`RESEND_FROM_EMAIL` and
`TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_WHATSAPP_FROM`/
`TWILIO_SMS_FROM` in `.env.local` (see `.env.example` for where to get
each). Then schedule `node scripts/cron.js` (or hit `/api/alerts/check`
and `/api/billing/reminders` directly) daily — Vercel Cron, a system
crontab, or a GitHub Actions schedule all work.

**A note on the JSON-file storage**: `src/lib/db.ts` now has a per-file
lock so concurrent writes from the same server process can't corrupt a
file (this was a real bug caught during testing — simultaneous
notifications were interleaving writes to the same file). This does
*not* help across multiple server instances, which is the real reason
this whole module gets swapped for Postgres before any real client goes
live on it.

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
