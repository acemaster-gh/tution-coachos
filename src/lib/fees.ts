import { readCollection } from "./db";
import type { Fee } from "./types";

export async function listFees(): Promise<Fee[]> {
  return readCollection<Fee>("fees.json");
}

export async function getFeesByStudent(studentId: string): Promise<Fee[]> {
  const fees = await listFees();
  return fees.filter((f) => f.studentId === studentId);
}

function isPastDue(fee: Fee, today: Date): boolean {
  return fee.status !== "paid" && new Date(fee.dueDate) < today;
}

export async function getEffectiveStatus(fee: Fee, today = new Date()): Promise<Fee["status"]> {
  if (fee.status === "paid") return "paid";
  return isPastDue(fee, today) ? "overdue" : "pending";
}

export interface FeeSummary {
  overdueCount: number;
  overdueAmount: number;
  pendingCount: number;
  pendingAmount: number;
}

export async function summarizeFees(today = new Date()): Promise<FeeSummary> {
  const fees = await listFees();
  const summary: FeeSummary = { overdueCount: 0, overdueAmount: 0, pendingCount: 0, pendingAmount: 0 };

  for (const fee of fees) {
    if (fee.status === "paid") continue;
    if (isPastDue(fee, today)) {
      summary.overdueCount++;
      summary.overdueAmount += fee.amount;
    } else {
      summary.pendingCount++;
      summary.pendingAmount += fee.amount;
    }
  }
  return summary;
}

/** Fees due within `withinDays` (inclusive) or already overdue — the set a reminder job should message about. */
export async function getReminderCandidates(withinDays = 3, today = new Date()): Promise<Fee[]> {
  const fees = await listFees();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + withinDays);

  return fees.filter((f) => f.status !== "paid" && new Date(f.dueDate) <= cutoff);
}
