-- ============================================================================
-- CoachOS — Phase 8 schema
-- Run this once against a fresh Supabase project (SQL Editor, or
-- `supabase db push` if you're using the CLI locally).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('admin', 'tutor', 'parent');
create type fee_status as enum ('paid', 'pending', 'overdue');
create type fee_plan as enum ('monthly', 'installment');
create type resource_type as enum ('notes', 'video', 'practice');
create type notification_channel as enum ('email', 'whatsapp', 'sms');

-- ---------------------------------------------------------------------------
-- institutes — the multi-tenant boundary. Every other table hangs off this.
-- ---------------------------------------------------------------------------
create table institutes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- users — app-level profile, one row per auth.users row. Supabase Auth
-- owns auth.users (email/password, etc.); this table holds the
-- institute/role data our RLS policies actually key off of.
-- ---------------------------------------------------------------------------
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  institute_id uuid not null references institutes(id) on delete cascade,
  name text not null,
  email text not null,
  role user_role not null,
  created_at timestamptz not null default now()
);
create index users_institute_id_idx on users(institute_id);
create unique index users_email_idx on users(email);

-- ---------------------------------------------------------------------------
-- students
-- ---------------------------------------------------------------------------
create table students (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references institutes(id) on delete cascade,
  name text not null,
  grade text not null,
  tutor_id uuid not null references users(id) on delete restrict,
  parent_id uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index students_institute_id_idx on students(institute_id);
create index students_tutor_id_idx on students(tutor_id);
create index students_parent_id_idx on students(parent_id);

-- ---------------------------------------------------------------------------
-- attendance — one row per student per date
-- ---------------------------------------------------------------------------
create table attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  date date not null,
  present boolean not null,
  created_at timestamptz not null default now(),
  unique (student_id, date)
);
create index attendance_student_id_idx on attendance(student_id);

-- ---------------------------------------------------------------------------
-- test_scores
-- ---------------------------------------------------------------------------
create table test_scores (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  subject text not null,
  score numeric not null check (score >= 0),
  max_score numeric not null check (max_score > 0),
  date date not null,
  created_at timestamptz not null default now(),
  constraint score_within_bounds check (score <= max_score)
);
create index test_scores_student_id_idx on test_scores(student_id);
create index test_scores_student_date_idx on test_scores(student_id, date);

-- ---------------------------------------------------------------------------
-- fees
-- ---------------------------------------------------------------------------
create table fees (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  amount numeric not null check (amount > 0),
  due_date date not null,
  status fee_status not null default 'pending',
  plan fee_plan not null default 'monthly',
  created_at timestamptz not null default now()
);
create index fees_student_id_idx on fees(student_id);
create index fees_status_idx on fees(status);

-- ---------------------------------------------------------------------------
-- leads — website enquiries, pre-enrollment
-- ---------------------------------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references institutes(id) on delete cascade,
  parent_name text not null,
  phone text not null,
  grade text not null,
  subject text not null,
  received_at timestamptz not null default now(),
  converted boolean not null default false,
  converted_student_id uuid references students(id) on delete set null
);
create index leads_institute_id_idx on leads(institute_id);

-- ---------------------------------------------------------------------------
-- resources — content library (Phase 5). Not in the original 7-table list;
-- added because the feature already exists in the app.
-- ---------------------------------------------------------------------------
create table resources (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references institutes(id) on delete cascade,
  title text not null,
  subject text not null,
  grade text not null,
  type resource_type not null,
  url text not null,
  uploaded_by uuid not null references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index resources_institute_id_idx on resources(institute_id);
create index resources_grade_idx on resources(grade);

-- ---------------------------------------------------------------------------
-- notifications — audit log of every send attempt (Phase 6/7)
-- ---------------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references institutes(id) on delete cascade,
  channel notification_channel not null,
  recipient text not null,
  subject text,
  body text not null,
  sent_at timestamptz not null default now(),
  ok boolean not null,
  error text
);
create index notifications_institute_id_idx on notifications(institute_id);

-- ---------------------------------------------------------------------------
-- alert_state — dedupe tracking so a student isn't re-notified for the
-- same unresolved flag on every check (Phase 7). Not in the original
-- 7-table list; added because the dedupe feature already exists.
-- ---------------------------------------------------------------------------
create table alert_state (
  student_id uuid primary key references students(id) on delete cascade,
  reasons_key text not null,
  notified_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

-- Helper functions run as the defining role (security definer), which
-- avoids infinite-recursion when a policy on `users` needs to query
-- `users` itself to find the caller's institute/role.
create or replace function my_institute_id()
returns uuid
language sql
security definer
stable
as $$
  select institute_id from public.users where id = auth.uid();
$$;

create or replace function my_role()
returns user_role
language sql
security definer
stable
as $$
  select role from public.users where id = auth.uid();
$$;

alter table institutes enable row level security;
alter table users enable row level security;
alter table students enable row level security;
alter table attendance enable row level security;
alter table test_scores enable row level security;
alter table fees enable row level security;
alter table leads enable row level security;
alter table resources enable row level security;
alter table notifications enable row level security;
alter table alert_state enable row level security;

-- institutes: any authenticated user can read their own institute row
create policy "read own institute"
  on institutes for select
  using (id = my_institute_id());

-- users: read anyone in your own institute; only admins can insert/update
create policy "read users in my institute"
  on users for select
  using (institute_id = my_institute_id());

create policy "admins can insert users in my institute"
  on users for insert
  with check (institute_id = my_institute_id() and my_role() = 'admin');

create policy "admins can update users in my institute"
  on users for update
  using (institute_id = my_institute_id() and my_role() = 'admin');

-- students: admins and tutors can see the full institute roster (a tutor
-- needs to see students outside their own batch for context, e.g. covering
-- a colleague); a parent can ONLY see their own child, never the roster.
create policy "admins and tutors read institute roster"
  on students for select
  using (institute_id = my_institute_id() and my_role() in ('admin', 'tutor'));

create policy "parents read only their own child"
  on students for select
  using (parent_id = auth.uid());

create policy "admins manage all students in my institute"
  on students for all
  using (institute_id = my_institute_id() and my_role() = 'admin')
  with check (institute_id = my_institute_id() and my_role() = 'admin');

create policy "tutors manage their own students"
  on students for update
  using (institute_id = my_institute_id() and my_role() = 'tutor' and tutor_id = auth.uid())
  with check (institute_id = my_institute_id() and my_role() = 'tutor' and tutor_id = auth.uid());

-- attendance: readable/writable by admin or the owning tutor; readable by
-- the student's parent
create policy "read attendance for my institute's students"
  on attendance for select
  using (
    exists (
      select 1 from students s
      where s.id = attendance.student_id
        and s.institute_id = my_institute_id()
        and (my_role() = 'admin' or s.tutor_id = auth.uid() or s.parent_id = auth.uid())
    )
  );

create policy "admins and owning tutors write attendance"
  on attendance for insert
  with check (
    exists (
      select 1 from students s
      where s.id = attendance.student_id
        and s.institute_id = my_institute_id()
        and (my_role() = 'admin' or s.tutor_id = auth.uid())
    )
  );

create policy "admins and owning tutors update attendance"
  on attendance for update
  using (
    exists (
      select 1 from students s
      where s.id = attendance.student_id
        and s.institute_id = my_institute_id()
        and (my_role() = 'admin' or s.tutor_id = auth.uid())
    )
  );

-- test_scores: same shape as attendance
create policy "read scores for my institute's students"
  on test_scores for select
  using (
    exists (
      select 1 from students s
      where s.id = test_scores.student_id
        and s.institute_id = my_institute_id()
        and (my_role() = 'admin' or s.tutor_id = auth.uid() or s.parent_id = auth.uid())
    )
  );

create policy "admins and owning tutors write scores"
  on test_scores for insert
  with check (
    exists (
      select 1 from students s
      where s.id = test_scores.student_id
        and s.institute_id = my_institute_id()
        and (my_role() = 'admin' or s.tutor_id = auth.uid())
    )
  );

-- fees: admin full access; parent can only read their own child's fees.
-- Writes (marking paid) happen only via the service-role webhook, which
-- bypasses RLS entirely — no policy needed for that path.
create policy "admins manage fees in my institute"
  on fees for all
  using (
    exists (
      select 1 from students s
      where s.id = fees.student_id and s.institute_id = my_institute_id() and my_role() = 'admin'
    )
  )
  with check (
    exists (
      select 1 from students s
      where s.id = fees.student_id and s.institute_id = my_institute_id() and my_role() = 'admin'
    )
  );

create policy "parents read their own child's fees"
  on fees for select
  using (
    exists (
      select 1 from students s
      where s.id = fees.student_id and s.parent_id = auth.uid()
    )
  );

-- leads: admin-only, scoped to institute
create policy "admins manage leads in my institute"
  on leads for all
  using (institute_id = my_institute_id() and my_role() = 'admin')
  with check (institute_id = my_institute_id() and my_role() = 'admin');

-- resources: readable by everyone in the institute; writable by tutors/admins
create policy "read resources in my institute"
  on resources for select
  using (institute_id = my_institute_id());

create policy "tutors and admins write resources"
  on resources for insert
  with check (institute_id = my_institute_id() and my_role() in ('tutor', 'admin'));

-- notifications: admin-only audit log
create policy "admins read notifications in my institute"
  on notifications for select
  using (institute_id = my_institute_id() and my_role() = 'admin');

-- alert_state: internal bookkeeping only, no direct client access at all —
-- deliberately NO policies here beyond RLS being enabled, which means
-- (with no permissive policy) it's fully locked down to normal clients.
-- Only the service-role key (used server-side in the alert-check job)
-- can read/write this table, since the service role bypasses RLS.

-- ============================================================================
-- Notes for whoever runs this:
-- - The `institutes` row and the first admin `users` row need to be
--   created together (see Step 4 deployment checklist) — there's a
--   chicken-and-egg problem where you can't self-register as the first
--   admin under RLS, so that first insert has to go through the service
--   role key once, manually or via a setup script.
-- - Passwords are NOT stored in this schema anywhere — Supabase Auth
--   (auth.users) owns credentials entirely.
-- ============================================================================
