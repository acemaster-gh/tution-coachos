import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import type { Lead } from "./types";

interface LeadRow {
  id: string;
  parent_name: string;
  phone: string;
  grade: string;
  subject: string;
  received_at: string;
  converted: boolean;
}

function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    parentName: row.parent_name,
    phone: row.phone,
    grade: row.grade,
    subject: row.subject,
    receivedAt: row.received_at,
    converted: row.converted,
  };
}

const LEAD_SELECT = "id, parent_name, phone, grade, subject, received_at, converted";

/** Admin-only, RLS-scoped to their own institute automatically. */
export async function listLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("leads").select(LEAD_SELECT).order("received_at", { ascending: false });
  if (error) throw new Error(`Failed to list leads: ${error.message}`, { cause: error });
  return (data as LeadRow[]).map(mapLead);
}

/**
 * Public — no login required. This deployment is single-institute (see
 * INSTITUTE_ID in .env.local); a true multi-tenant deployment serving
 * several institutes from one instance would instead resolve the
 * institute from the request's subdomain/slug here.
 */
export async function addLead(input: { parentName: string; phone: string; grade: string; subject: string }): Promise<Lead> {
  const instituteId = process.env.INSTITUTE_ID;
  if (!instituteId) {
    throw new Error("INSTITUTE_ID is not set — the lead form can't determine which institute to save this to.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("leads")
    .insert({
      institute_id: instituteId,
      parent_name: input.parentName,
      phone: input.phone,
      grade: input.grade,
      subject: input.subject,
    })
    .select(LEAD_SELECT)
    .single();
  if (error) throw new Error(`Failed to save lead: ${error.message}`, { cause: error });
  return mapLead(data as LeadRow);
}

export async function markLeadConverted(leadId: string, studentId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ converted: true, converted_student_id: studentId })
    .eq("id", leadId);
  if (error) throw new Error(`Failed to mark lead ${leadId} converted: ${error.message}`, { cause: error });
}
