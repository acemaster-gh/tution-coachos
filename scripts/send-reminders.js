// Computes and logs fee reminders directly against the JSON data files —
// no server needs to be running. This is what you'd schedule as a daily
// cron job (or Vercel Cron once deployed) once Phase 6 wires in a real
// WhatsApp/email send instead of console.log.
//
// Run: node scripts/send-reminders.js

const fs = require("node:fs");
const path = require("node:path");

function readJSON(name) {
  const p = path.join(__dirname, "..", "data", name);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function main() {
  const fees = readJSON("fees.json");
  const students = readJSON("students.json");
  const users = readJSON("users.json");

  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + 3);

  const candidates = fees.filter((f) => f.status !== "paid" && new Date(f.dueDate) <= cutoff);

  if (candidates.length === 0) {
    console.log("No reminders due today.");
    return;
  }

  console.log(`${candidates.length} reminder(s) to send:\n`);
  for (const fee of candidates) {
    const student = students.find((s) => s.id === fee.studentId);
    const parent = student ? users.find((u) => u.id === student.parentId) : undefined;
    const overdue = new Date(fee.dueDate) < today;
    console.log(
      `  ${overdue ? "[OVERDUE]" : "[DUE SOON]"} ${parent?.name ?? "Unknown parent"} <${parent?.email ?? "no email on file"}> ` +
      `— Rs.${fee.amount} for ${student?.name ?? "unknown student"}, due ${fee.dueDate}`
    );
  }
}

main();
