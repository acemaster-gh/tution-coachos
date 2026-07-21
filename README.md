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
- [ ] **Phase 2** — auth + role-based portal shell (admin / tutor / parent)
- [ ] **Phase 3** — student dashboard & analytics (the real version of the hero mockup)
- [ ] **Phase 4** — billing & fee automation (Razorpay)
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
