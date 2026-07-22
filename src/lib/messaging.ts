import { notify } from "./notifications";
import { siteConfig } from "@/config/site";
import type { Lead, Fee, Student } from "./types";
import type { StudentStatus } from "./students";

// ── Where institute-side alerts (admin/tutor) land when no real ────────
// per-user phone/email routing exists yet for that role. Set these in
// .env.local — falls back to siteConfig contact info if unset.
function adminContact() {
  return {
    email: process.env.ADMIN_NOTIFY_EMAIL || siteConfig.email,
    phone: process.env.ADMIN_NOTIFY_PHONE || siteConfig.whatsapp,
  };
}

export async function notifyAdminOfNewLead(lead: Lead) {
  const admin = adminContact();
  const body =
    `New enquiry: ${lead.parentName} (${lead.phone}) — Class ${lead.grade}, ${lead.subject}. ` +
    `Received ${new Date(lead.receivedAt).toLocaleString("en-IN")}.`;

  await Promise.all([
    notify({ channel: "email", to: admin.email, subject: `New enquiry — ${lead.parentName}`, body }),
    notify({ channel: "whatsapp", to: admin.phone, body }),
  ]);
}

export async function notifyParentOfFeeDue(parentEmail: string, parentPhone: string | undefined, studentName: string, fee: Fee) {
  const isOverdue = new Date(fee.dueDate) < new Date();
  const body =
    `${siteConfig.instituteName}: ₹${fee.amount.toLocaleString("en-IN")} ${isOverdue ? "is overdue" : "is due"} ` +
    `for ${studentName}, due ${new Date(fee.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}. ` +
    `Pay anytime from the parent portal.`;

  const tasks = [notify({ channel: "email", to: parentEmail, subject: `Fee ${isOverdue ? "overdue" : "reminder"} — ${studentName}`, body })];
  if (parentPhone) tasks.push(notify({ channel: "whatsapp", to: parentPhone, body }));
  await Promise.all(tasks);
}

export async function notifyOnStudentFlag(
  student: Student,
  status: StudentStatus,
  parentEmail: string,
  parentPhone: string | undefined,
  tutorEmail: string
) {
  const reasonText = status.reasons.join(", ");
  const parentBody =
    `${siteConfig.instituteName}: a quick note on ${student.name} — ${reasonText}. ` +
    `Your tutor has been notified and will follow up. Full detail is in the parent portal.`;
  const tutorBody = `Flag on your roster: ${student.name} (Class ${student.grade}) — ${reasonText}. Please follow up.`;

  const tasks = [
    notify({ channel: "email", to: parentEmail, subject: `A note on ${student.name}'s progress`, body: parentBody }),
    notify({ channel: "email", to: tutorEmail, subject: `Roster flag — ${student.name}`, body: tutorBody }),
  ];
  if (parentPhone) tasks.push(notify({ channel: "whatsapp", to: parentPhone, body: parentBody }));
  await Promise.all(tasks);
}
