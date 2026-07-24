-- ============================================================================
-- Phase 8.1 — atomic enrollment
--
-- Previously, enrollment did 3 separate un-transacted client calls: create
-- the auth user, insert the profile row, insert the student row (with
-- best-effort manual cleanup if a later step failed). This function makes
-- the two DB inserts atomic with each other: if the student insert fails
-- for any reason, the profile insert rolls back too, automatically.
--
-- HONEST LIMIT: the auth.users row (the actual login credential) is
-- created via Supabase's Admin API — an HTTP call to their auth service,
-- not a database operation this function can see or participate in. True
-- atomicity across "create an HTTP-managed auth account" and "write DB
-- rows" isn't achievable in a single Postgres transaction; that boundary
-- still needs the application-level cleanup (delete the auth user) if
-- this function throws. What's fixed is the second half — the two DB
-- writes can no longer partially commit.
-- ============================================================================

create or replace function enroll_student_records(
  p_parent_id uuid,
  p_institute_id uuid,
  p_parent_name text,
  p_parent_email text,
  p_student_name text,
  p_grade text,
  p_tutor_id uuid,
  p_lead_id uuid default null
) returns uuid
language plpgsql
security definer
as $$
declare
  v_student_id uuid;
begin
  insert into users (id, institute_id, name, email, role)
  values (p_parent_id, p_institute_id, p_parent_name, p_parent_email, 'parent');

  insert into students (institute_id, name, grade, tutor_id, parent_id)
  values (p_institute_id, p_student_name, p_grade, p_tutor_id, p_parent_id)
  returning id into v_student_id;

  if p_lead_id is not null then
    update leads set converted = true, converted_student_id = v_student_id where id = p_lead_id;
  end if;

  return v_student_id;
end;
$$;

-- security definer means this runs with the function owner's privileges,
-- bypassing RLS — appropriate here since it's only ever called via the
-- service-role admin client during enrollment, which already bypasses
-- RLS anyway. Restricting who can EXECUTE it matters more than RLS here:
revoke all on function enroll_student_records from public;
-- grant execute only to the service role (the admin client authenticates
-- as this role) — regular authenticated/anon users cannot call it directly.
grant execute on function enroll_student_records to service_role;
