import { NextResponse } from "next/server";
import { getReminderCandidates } from "@/lib/fees";
import { listStudents } from "@/lib/students";
import { notifyParentOfFeeDue } from "@/lib/messaging";
import { assertCronAuthorized } from "@/lib/cronAuth";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  const denied = assertCronAuthorized(request);
  if (denied) return denied;

  // No user session exists for a cron-triggered request — use the admin
  // client explicitly, or RLS would silently return zero rows for
  // everything (see the comment on students.ts's client parameter).
  const admin = createAdminClient();

  const [candidates, students, { data: userRows, error: usersError }] = await Promise.all([
    getReminderCandidates(3, new Date(), admin),
    listStudents(admin),
    admin.from("users").select("id, name, email"),
  ]);
  if (usersError) {
    return NextResponse.json({ error: `Failed to load users: ${usersError.message}` }, { status: 500 });
  }

  const results = [];

  for (const fee of candidates) {
    const student = students.find((s) => s.id === fee.studentId);
    const parent = student ? userRows.find((u) => u.id === student.parentId) : undefined;

    if (!student || !parent) {
      results.push({ feeId: fee.id, sent: false, reason: "no matching parent on file" });
      continue;
    }

    await notifyParentOfFeeDue(parent.email, undefined, student.name, fee);
    results.push({ feeId: fee.id, sent: true, studentName: student.name, parentName: parent.name });
  }

  return NextResponse.json({ count: results.length, results });
}
