# Deploying CoachOS (Phase 8 — Supabase + Vercel)

## 1. Create the Supabase project

1. [supabase.com](https://supabase.com) → New Project. Pick a region close to your users (Mumbai/Singapore for India).
2. Once it's up: **Settings → API** → copy `Project URL`, `anon public` key, and `service_role` key (click "reveal"). You'll need all three.
3. **SQL Editor** → paste the entire contents of `supabase/migrations/0001_init.sql` → Run. This was tested against a real local Postgres 16 instance during development (schema creation, all constraints, and RLS policies were verified to actually enforce the intended access rules — not just that the SQL parses), but has **not** been run against Supabase's hosted Postgres specifically. Supabase runs vanilla Postgres 15+, so it should behave identically, but this is the one thing worth double-checking after you run it.

## 2. Bootstrap the first institute + admin (the chicken-and-egg step)

Row Level Security means a brand-new user can't create their own `institutes` row or their own `admin` role — those actions require *already* being an admin. So the very first institute and admin account has to be created with the service role key, once, manually:

In the Supabase SQL Editor:
```sql
insert into institutes (name, slug) values ('Ascent Learning Centre', 'ascent')
returning id; -- copy this UUID, it's your INSTITUTE_ID
```

Then, in **Authentication → Users** in the Supabase dashboard, click **Add user**, create the admin's email/password (this creates the `auth.users` row). Copy the new user's UUID, then back in SQL Editor:
```sql
insert into users (id, institute_id, name, email, role)
values ('<the-uuid-you-just-copied>', '<the-institute-id-from-above>', 'Your Name', 'you@example.com', 'admin');
```

From here on, that admin account can enroll everyone else (tutors, parents) through the app's own `/api/admin/enroll` UI — no more manual SQL needed.

## 3. Local `.env.local`

```bash
cp .env.example .env.local
```
Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `INSTITUTE_ID` from steps 1–2. Test locally:
```bash
npm install
npm run dev
```
Log in with the admin account you just created. Everything else (Razorpay, Resend, Twilio, CRON_SECRET) can stay blank locally — those features degrade to logging instead of crashing, same as before.

## 4. Push to GitHub, then deploy on Vercel

```bash
git push origin main
```
On [vercel.com](https://vercel.com): **Add New → Project** → import the repo → before deploying, expand **Environment Variables** and paste in every variable from `.env.local` (all of them — Supabase, Razorpay, Resend, Twilio, `CRON_SECRET`, `INSTITUTE_ID`). Vercel auto-detects Next.js; no build command changes needed.

## 5. Wire up the webhooks (only after your first deploy, once you have a real URL)

- **Razorpay** dashboard → Webhooks → add `https://your-app.vercel.app/api/billing/webhook`, subscribe to `payment.captured` and `order.paid`, set a webhook secret, paste that same secret into Vercel's `RAZORPAY_WEBHOOK_SECRET` and redeploy.
- **Cron** (reminders + alert checks): add a `vercel.json` at the repo root:
  ```json
  {
    "crons": [
      { "path": "/api/alerts/check", "schedule": "0 3 * * *" },
      { "path": "/api/billing/reminders", "schedule": "0 4 * * *" }
    ]
  }
  ```
  Vercel Cron calls these with an internal mechanism, not your `CRON_SECRET` header — for Vercel specifically, protect these routes by checking `request.headers.get('authorization') === \`Bearer ${process.env.CRON_SECRET}\`` where Vercel automatically injects `CRON_SECRET` as that header for its own cron calls (see [Vercel's cron docs](https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs) — this is already exactly what `src/lib/cronAuth.ts` checks, so no code change needed, just set `CRON_SECRET` in Vercel's env vars and Vercel handles the rest).

## 6. What to actually verify after deploying (I could not test any of this from the sandbox)

- [ ] Log in as the admin, tutor, and parent accounts and confirm each portal loads
- [ ] Submit the enquiry form on the live site, confirm it appears on the admin dashboard
- [ ] Enroll a lead, confirm the generated password actually logs the new parent in
- [ ] Mark attendance / record a score as the tutor, confirm the parent portal reflects it
- [ ] Make a real (small) Razorpay test-mode payment, confirm the webhook actually flips the fee to `paid` — check **Supabase → Table Editor → fees** directly, don't just trust the UI
- [ ] Manually visit `/api/alerts/check` and `/api/billing/reminders` **without** the auth header — confirm you get `401`, not data
