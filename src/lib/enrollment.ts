import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/utils/supabase/admin";

export class EnrollmentError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "EnrollmentError";
    this.status = status;
  }
}

function generateTempPassword(): string {
  // crypto.randomBytes is a CSPRNG (cryptographically secure pseudo-random
  // number generator) — unlike Math.random(), its output isn't
  // predictable from prior outputs. Math.random() uses a non-cryptographic
  // PRNG (xorshift128+ in V8) explicitly not designed to resist prediction
  // attacks; using it for anything security-relevant (passwords, tokens)
  // is a real, if narrow, vulnerability class.
  return randomBytes(9).toString("base64url"); // 12 chars, ~72 bits of entropy
}

export interface EnrollInput {
  leadId?: string;
  studentName: string;
  grade: string;
  subject: string;
  tutorId: string;
  parentName: string;
  parentEmail: string;
}

/**
 * Creates the parent's Supabase Auth account, then calls the
 * `enroll_student_records` Postgres function (supabase/migrations/
 * 0002_atomic_enrollment.sql) to insert the profile + student rows as a
 * single atomic transaction — if the student insert fails, the profile
 * insert rolls back too, automatically, instead of the previous
 * approach's manual best-effort cleanup of separate calls.
 *
 * HONEST LIMIT (documented in the migration too): the auth account
 * creation itself is a separate HTTP call to Supabase's auth service,
 * not something a Postgres transaction can see — true atomicity across
 * "create an auth account" and "write DB rows" isn't achievable in one
 * transaction. If the RPC call fails after the auth account was
 * created, we still fall back to deleting that auth account manually.
 */
export async function enrollStudent(input: EnrollInput): Promise<{ tempPassword: string; studentId: string; parentId: string }> {
  const admin = createAdminClient();
  const instituteId = process.env.INSTITUTE_ID;
  if (!instituteId) throw new Error("INSTITUTE_ID is not set.");

  const tempPassword = generateTempPassword();

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: input.parentEmail,
    password: tempPassword,
    email_confirm: true,
  });
  if (authError || !authUser.user) {
    // Supabase's auth API enforces email uniqueness atomically at the
    // database level — checking "does this email exist?" first and
    // creating the account second (as this code used to do) is a
    // textbook TOCTOU race: two enrollments for the same email racing
    // the check-then-act window can both pass the check. Removing the
    // pre-check and instead reacting to the atomic operation's own
    // failure eliminates the race entirely, rather than narrowing it.
    const message = authError?.message ?? "";
    const isDuplicate = /already.*registered|already exists|duplicate/i.test(message);
    throw new EnrollmentError(
      isDuplicate ? "An account with that email already exists." : `Failed to create parent account: ${message || "unknown error"}`,
      isDuplicate ? 409 : 500
    );
  }
  const parentId = authUser.user.id;

  const { data: studentId, error: rpcError } = await admin.rpc("enroll_student_records", {
    p_parent_id: parentId,
    p_institute_id: instituteId,
    p_parent_name: input.parentName,
    p_parent_email: input.parentEmail,
    p_student_name: input.studentName,
    p_grade: input.grade,
    p_tutor_id: input.tutorId,
    p_lead_id: input.leadId ?? null,
  });

  if (rpcError || !studentId) {
    // The RPC's two DB inserts are already guaranteed atomic with each
    // other (tested — see 0002_atomic_enrollment.sql). This cleanup only
    // handles the boundary a DB transaction can't cover: the auth
    // account that was created just above, outside any transaction.
    await admin.auth.admin.deleteUser(parentId).catch(() => {});
    throw new Error(`Failed to create student record: ${rpcError?.message ?? "unknown error"}`, { cause: rpcError });
  }

  return { tempPassword, studentId: studentId as string, parentId };
}
