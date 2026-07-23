import { listStudents, getStudentStatus } from "./students";
import { createAdminClient } from "@/utils/supabase/admin";
import { notifyOnStudentFlag } from "./messaging";

interface AlertStateRow {
  student_id: string;
  reasons_key: string;
}

/**
 * Scans all students, and for anyone newly flagged (or flagged for a new
 * reason since last check) sends the parent+tutor notification and
 * records it in alert_state so the next check doesn't re-send for the
 * same unresolved issue. If a student's flag clears, their state row is
 * left alone until it naturally ages out — the key check is whether the
 * CURRENT reasons match what's stored, not whether a row exists.
 *
 * Uses the admin client throughout: alert_state has no RLS policies at
 * all (confirmed by testing — even an admin gets zero rows through a
 * normal session), so this background job runs as a privileged system
 * process, not as any particular user.
 */
export async function runAlertCheck(): Promise<{ checked: number; notified: string[] }> {
  const admin = createAdminClient();

  const [students, { data: stateRows, error: stateError }, { data: userRows, error: usersError }] = await Promise.all([
    listStudents(admin),
    admin.from("alert_state").select("student_id, reasons_key"),
    admin.from("users").select("id, email"),
  ]);
  if (stateError) throw new Error(`Failed to read alert state: ${stateError.message}`, { cause: stateError });
  if (usersError) throw new Error(`Failed to read users: ${usersError.message}`, { cause: usersError });

  const stateMap = new Map((stateRows as AlertStateRow[]).map((s) => [s.student_id, s.reasons_key]));
  const emailById = new Map((userRows as { id: string; email: string }[]).map((u) => [u.id, u.email]));
  const notified: string[] = [];

  for (const student of students) {
    const status = getStudentStatus(student);
    if (!status.flagged) continue;

    const reasonsKey = [...status.reasons].sort().join("|");
    if (stateMap.get(student.id) === reasonsKey) continue; // already notified for this exact issue

    const parentEmail = emailById.get(student.parentId);
    const tutorEmail = emailById.get(student.tutorId);

    if (!parentEmail || !tutorEmail) {
      console.warn(
        `[alerts] skipping ${student.name} — no user record for ${!parentEmail ? "parent" : "tutor"}. Will retry on next check.`
      );
      continue;
    }

    await notifyOnStudentFlag(student, status, parentEmail, undefined, tutorEmail);
    notified.push(student.name);

    const { error: upsertError } = await admin
      .from("alert_state")
      .upsert({ student_id: student.id, reasons_key: reasonsKey, notified_at: new Date().toISOString() });
    if (upsertError) console.error(`[alerts] failed to record alert state for ${student.name}:`, upsertError.message);
  }

  return { checked: students.length, notified };
}
