import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Fee } from "./types";

interface FeeRow {
  id: string;
  student_id: string;
  amount: number;
  due_date: string;
  status: Fee["status"];
  plan: Fee["plan"];
}

function mapFee(row: FeeRow): Fee {
  return { id: row.id, studentId: row.student_id, amount: row.amount, dueDate: row.due_date, status: row.status, plan: row.plan };
}

const FEE_SELECT = "id, student_id, amount, due_date, status, plan";

export async function listFees(client?: SupabaseClient): Promise<Fee[]> {
  const supabase = client ?? (await createClient());
  const { data, error } = await supabase.from("fees").select(FEE_SELECT);
  if (error) throw new Error(`Failed to list fees: ${error.message}`, { cause: error });
  return (data as FeeRow[]).map(mapFee);
}

export async function getFeesByStudent(studentId: string, client?: SupabaseClient): Promise<Fee[]> {
  const supabase = client ?? (await createClient());
  const { data, error } = await supabase.from("fees").select(FEE_SELECT).eq("student_id", studentId);
  if (error) throw new Error(`Failed to fetch fees for student ${studentId}: ${error.message}`, { cause: error });
  return (data as FeeRow[]).map(mapFee);
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
export async function getReminderCandidates(withinDays = 3, today = new Date(), client?: SupabaseClient): Promise<Fee[]> {
  const fees = await listFees(client);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + withinDays);

  return fees.filter((f) => f.status !== "paid" && new Date(f.dueDate) <= cutoff);
}

/**
 * Marks a fee paid. Uses the ADMIN client deliberately — this is only
 * ever called from the Razorpay webhook route, which has no user session
 * at all (Razorpay's server is calling us, authenticated by HMAC
 * signature, not a Supabase session), so RLS has nothing to check
 * against. The webhook route itself is what verifies this is legitimate.
 */
export async function markFeePaid(feeId: string): Promise<Fee> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("fees").update({ status: "paid" }).eq("id", feeId).select(FEE_SELECT).single();
  if (error) throw new Error(`Failed to mark fee ${feeId} paid: ${error.message}`, { cause: error });
  return mapFee(data as FeeRow);
}
