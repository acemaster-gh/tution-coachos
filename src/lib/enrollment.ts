import { createAdminClient } from "@/utils/supabase/admin";
import { markLeadConverted } from "./leads";

function generateTempPassword(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase();
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
 * Creates a real Supabase Auth account for the parent + a matching
 * profile row + the student record, in that order. Uses the ADMIN
 * client throughout — creating an auth.users row on someone else's
 * behalf requires the service-role admin API (a regular signUp() call
 * only works for the person signing themselves up).
 *
 * Not wrapped in a database transaction — Supabase's JS client doesn't
 * expose multi-table transactions directly. If the student insert fails
 * after the auth user was created, you'd have an orphaned auth account
 * with no student attached. For production hardening beyond this phase,
 * consider a Postgres function (rpc) that does all three inserts
 * atomically instead of three separate client calls.
 */
export async function enrollStudent(input: EnrollInput): Promise<{ tempPassword: string; studentId: string; parentId: string }> {
  const admin = createAdminClient();
  const instituteId = process.env.INSTITUTE_ID;
  if (!instituteId) throw new Error("INSTITUTE_ID is not set.");

  const tempPassword = generateTempPassword();

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: input.parentEmail,
    password: tempPassword,
    email_confirm: true, // skip email verification for an admin-created account
  });
  if (authError || !authUser.user) {
    throw new Error(`Failed to create parent account: ${authError?.message ?? "unknown error"}`, { cause: authError });
  }
  const parentId = authUser.user.id;

  const { error: profileError } = await admin.from("users").insert({
    id: parentId,
    institute_id: instituteId,
    name: input.parentName,
    email: input.parentEmail,
    role: "parent",
  });
  if (profileError) {
    // Best-effort cleanup so we don't leave an orphaned auth account with
    // no profile row — see the transaction caveat in the doc comment above.
    await admin.auth.admin.deleteUser(parentId).catch(() => {});
    throw new Error(`Failed to create parent profile: ${profileError.message}`, { cause: profileError });
  }

  const { data: student, error: studentError } = await admin
    .from("students")
    .insert({
      institute_id: instituteId,
      name: input.studentName,
      grade: input.grade,
      tutor_id: input.tutorId,
      parent_id: parentId,
    })
    .select("id")
    .single();
  if (studentError || !student) {
    await admin.auth.admin.deleteUser(parentId).catch(() => {});
    throw new Error(`Failed to create student record: ${studentError?.message ?? "unknown error"}`, { cause: studentError });
  }

  if (input.leadId) {
    await markLeadConverted(input.leadId, student.id).catch((err) => {
      console.error("[enrollment] enrollment succeeded but marking the lead converted failed:", err);
    });
  }

  return { tempPassword, studentId: student.id, parentId };
}
