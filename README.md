# CoachOS

**A resellable web platform for coaching centres and tutoring institutes.**

Built to solve the five problems that actually cost these businesses students and founder-hours: poor student retention (no data on who's slipping), fee collection delays, local visibility vs. big ed-tech chains, tutor dependency, and admin overload.

**The business model:** clone this repo per client, edit one config file (`src/config/site.ts`), deploy in 15 minutes, charge a monthly SaaS fee. The landing page *is* the sales pitch — show it to a coaching-centre owner with their name on it.

---

## Live Demo
> Login at `/login` with any of the credentials below

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ascentlearning.example` | `demo1234` |
| Tutor | `tutor@ascentlearning.example` | `demo1234` |
| Parent | `parent@ascentlearning.example` | `demo1234` |

---

## What's Built

### Marketing Site (`/`)
- Animated hero with live dashboard preview
- Stats counter, problem grid, testimonials carousel
- Pricing section with toggle (monthly/yearly)
- FAQ accordion, enquiry lead form
- Full SEO metadata, OG tags, scroll progress bar

### Auth & Portal (`/portal`)
- Session-based login with bcrypt password hashing
- Role-based access: **Admin**, **Tutor**, **Parent**
- Glassmorphism header with gradient role badges
- Mobile tab-bar navigation

### Admin Portal (`/portal/admin`)
- Live enquiry feed from lead form submissions
- Enroll a lead → creates student + parent portal account in one click
- Fees overdue summary (total ₹ amount + student count)
- Flagged student list with reasons
- Quick-action buttons: run alert check, send fee reminders, view notification log

### Tutor Portal (`/portal/tutor`)
- Student roster split into "Needs attention" / "On track"
- Click any student → mark today's attendance, record a test score
- Full score history with colored severity bars (green/amber/red)

### Parent Portal (`/portal/parent`)
- Live 4-stat grid: attendance %, tests logged, fee status, overall status
- Progress chart (SVG, animated) from real score data
- Pay overdue fee via Razorpay inline checkout

### Content Library (`/portal/library`)
- Tutors/admins upload notes, videos, practice sets
- Parents see material filtered to their child's grade
- Resources grouped by subject with type icons

### Notification System
- Email via [Resend](https://resend.com), WhatsApp/SMS via [Twilio](https://twilio.com)
- **Logs instead of failing** when keys aren't set — nothing breaks in dev
- Full audit log at `/portal/admin/notifications`
- Three automated triggers: new enquiry → admin, fee due → parent, student flagged → parent + tutor

### Billing
- Razorpay order creation and checkout widget
- Fee reminder cron (`scripts/send-reminders.js`)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + custom design system |
| Auth | bcrypt + signed JWT sessions |
| Database | JSON files (dev) → swap to Supabase/Postgres for production |
| Payments | Razorpay |
| Email | Resend |
| WhatsApp/SMS | Twilio |
| Hosting | Vercel (recommended) |

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in secrets (see section below)
cp .env.example .env.local

# 3. Start dev server
npm run dev
# → http://localhost:3000

# 4. Reset demo data (run before demos or before committing)
node scripts/reset-demo-data.js
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# REQUIRED for production — long random string for signing sessions
SESSION_SECRET=

# Razorpay (payments) — get test keys free at dashboard.razorpay.com
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Resend (email) — free at resend.com
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Twilio (WhatsApp / SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
TWILIO_SMS_FROM=

# Where admin alerts land (falls back to site.ts contact info if unset)
ADMIN_NOTIFY_EMAIL=
ADMIN_NOTIFY_PHONE=
```

> **Without any of these**, the app still runs fully. Payments show "not configured", notifications log to console. Only `SESSION_SECRET` is required for a secure production deployment.

---

## Deploying to Production (Vercel + Supabase)

### Step 1 — Push to GitHub
The repo is already at `https://github.com/acemaster-gh/tution-coachos`

### Step 2 — Create a Vercel project
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select `acemaster-gh/tution-coachos`
3. Framework: **Next.js** (auto-detected)
4. Add all env vars from `.env.example` in the Vercel dashboard

### Step 3 — Swap JSON storage for Supabase (for real clients)
The JSON-file storage in `src/lib/db.ts` is intentionally simple for demos.
For a real client deployment, replace it with Supabase:

1. Create a free Supabase project at [supabase.com](https://supabase.com)
2. Run the schema below in the Supabase SQL editor
3. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to your env vars
4. Replace the functions in `src/lib/db.ts` with Supabase client calls

**Supabase schema (run once):**
```sql
create table users (
  id text primary key,
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('admin','tutor','parent')),
  student_id text,
  created_at timestamptz default now()
);

create table students (
  id text primary key,
  name text not null,
  grade text not null,
  tutor_id text,
  parent_id text,
  created_at timestamptz default now()
);

create table scores (
  id text primary key default gen_random_uuid(),
  student_id text references students(id),
  subject text not null,
  score numeric not null,
  max_score numeric not null,
  date date not null,
  created_at timestamptz default now()
);

create table attendance (
  id text primary key default gen_random_uuid(),
  student_id text references students(id),
  date date not null,
  present boolean not null,
  created_at timestamptz default now(),
  unique(student_id, date)
);

create table fees (
  id text primary key,
  student_id text references students(id),
  amount numeric not null,
  due_date date not null,
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table leads (
  id text primary key,
  parent_name text not null,
  phone text not null,
  grade text not null,
  subject text not null,
  received_at timestamptz default now(),
  converted boolean default false
);

create table resources (
  id text primary key,
  title text not null,
  subject text not null,
  grade text not null,
  type text not null check (type in ('notes','video','practice')),
  url text not null,
  uploaded_by text,
  uploaded_at timestamptz default now()
);

create table notifications (
  id text primary key,
  channel text not null,
  to_address text not null,
  subject text,
  body text not null,
  sent_at timestamptz default now(),
  ok boolean default true,
  error text
);
```

### Step 4 — Set up Razorpay (payments)
1. Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Get test-mode keys → add to Vercel env vars
3. When ready for real payments, switch to live keys

### Step 5 — Set up notifications
- **Email**: Sign up at [resend.com](https://resend.com), get API key, add `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
- **WhatsApp/SMS**: Sign up at [twilio.com](https://twilio.com), get credentials, add the four `TWILIO_*` vars
- **Cron**: In Vercel, add a Cron Job to call `/api/alerts/check` and `/api/billing/reminders` daily

---

## Reselling to a New Client

1. **Fork or duplicate** this repo (one repo per client, or use branches)
2. **Edit only** `src/config/site.ts`:
   - `instituteName`, `tagline`, `city`, `phone`, `whatsapp`
   - `subjects` array (what they teach)
   - `stats` (their actual numbers: students, years, results)
   - `testimonials` (replace with real parent quotes)
3. `npm run dev` to preview with their branding
4. Deploy to Vercel with a custom domain (e.g., `portal.theirinstitute.com`)
5. Add their API keys for Razorpay, Resend, Twilio

**Each client gets**: their own branded site, their own portal, their own data — fully isolated.

---

## Contributing (for collaborators)

```bash
# Clone
git clone https://github.com/acemaster-gh/tution-coachos.git
cd tution-coachos

# Install
npm install

# Set up env
cp .env.example .env.local
# Edit .env.local — SESSION_SECRET is the only one required for local dev

# Start dev server
npm run dev

# Before committing — reset demo data so test entries don't get committed
node scripts/reset-demo-data.js

# Create a branch for your work
git checkout -b feature/your-feature-name

# Push and open a PR to main
git push origin feature/your-feature-name
```

### Project structure
```
src/
  config/site.ts          ← per-client branding (the ONE file to edit per sale)
  app/
    page.tsx              ← marketing landing page
    login/page.tsx        ← auth page
    portal/               ← all role-based portal pages
    api/                  ← all API routes
  components/             ← all UI components
  lib/                    ← business logic (students, fees, notifications, db)
data/
  students.json           ← student records (replaced by Supabase in prod)
  users.json              ← user accounts
  fees.json               ← fee records
  leads.json              ← enquiry submissions
  resources.json          ← library content
  seed/                   ← canonical demo data (used by reset script)
scripts/
  reset-demo-data.js      ← restore clean demo state
  seed.js                 ← regenerate users
  cron.js                 ← manual trigger for daily jobs
```

### Key rules
- **One config file per client** — never hardcode institute names/details anywhere except `src/config/site.ts`
- **Reset before committing** — run `node scripts/reset-demo-data.js` so test data doesn't ship
- **Server components by default** — only add `"use client"` when you need hooks or browser event handlers
- **No secrets in code** — all API keys go in `.env.local` (gitignored)

---

## What's Left / Roadmap

| Item | Status |
|---|---|
| JSON → Supabase/Postgres | Designed, not wired up — intentional for demo simplicity |
| Multi-tenant (one deploy, many clients) | Not built — current model is one repo per client |
| Mobile app (parent notifications) | Not planned — PWA push notifications could be added |
| AI tutor insights | Could use Gemini API via Firebase AI Logic |

---

## Security

See [`SECURITY.md`](./SECURITY.md) for the full security posture.
Key points: bcrypt password hashing, signed JWT sessions, input sanitisation on all API routes, rate limiting on auth endpoints, Content Security Policy headers.
