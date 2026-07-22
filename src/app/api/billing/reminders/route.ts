import { NextResponse } from "next/server";
import { getReminderCandidates } from "@/lib/fees";
import { listStudents } from "@/lib/students";
import { listUsers } from "@/lib/db";

export async function GET() {
  const [candidates, students, users] = await Promise.all([
    getReminderCandidates(),
    listStudents(),
    listUsers(),
  ]);

  const enriched = candidates.map((fee) => {
    const student = students.find((s) => s.id === fee.studentId);
    const parent = student ? users.find((u) => u.id === student.parentId) : undefined;
    return {
      feeId: fee.id,
      amount: fee.amount,
      dueDate: fee.dueDate,
      status: fee.status,
      studentName: student?.name ?? "Unknown student",
      parentName: parent?.name ?? "Unknown parent",
      parentEmail: parent?.email,
    };
  });

  // Stand-in for the real send step. Phase 6 replaces this console.log
  // with a WhatsApp Business API / Twilio / email call and puts this
  // whole route behind a cron trigger (Vercel Cron or similar).
  for (const r of enriched) {
    console.log(`[reminder] would notify ${r.parentName} (${r.parentEmail}) — ₹${r.amount} for ${r.studentName}, due ${r.dueDate}`);
  }

  return NextResponse.json({ count: enriched.length, reminders: enriched });
}
