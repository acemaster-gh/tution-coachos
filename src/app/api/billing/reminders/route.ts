import { NextResponse } from "next/server";
import { getReminderCandidates } from "@/lib/fees";
import { listStudents } from "@/lib/students";
import { listUsers } from "@/lib/db";
import { notifyParentOfFeeDue } from "@/lib/messaging";

export async function GET() {
  const [candidates, students, users] = await Promise.all([
    getReminderCandidates(),
    listStudents(),
    listUsers(),
  ]);

  const results = [];

  for (const fee of candidates) {
    const student = students.find((s) => s.id === fee.studentId);
    const parent = student ? users.find((u) => u.id === student.parentId) : undefined;

    if (!student || !parent) {
      results.push({ feeId: fee.id, sent: false, reason: "no matching parent on file" });
      continue;
    }

    await notifyParentOfFeeDue(parent.email, undefined, student.name, fee);
    results.push({ feeId: fee.id, sent: true, studentName: student.name, parentName: parent.name });
  }

  return NextResponse.json({ count: results.length, results });
}
