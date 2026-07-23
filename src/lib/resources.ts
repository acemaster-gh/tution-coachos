import { createClient } from "@/utils/supabase/server";
import type { Resource } from "./types";

interface ResourceRow {
  id: string;
  title: string;
  subject: string;
  grade: string;
  type: Resource["type"];
  url: string;
  uploaded_by: string;
  created_at: string;
}

function mapResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    grade: row.grade,
    type: row.type,
    url: row.url,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
  };
}

const RESOURCE_SELECT = "id, title, subject, grade, type, url, uploaded_by, created_at";

export async function listResources(): Promise<Resource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("resources").select(RESOURCE_SELECT).order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to list resources: ${error.message}`, { cause: error });
  return (data as ResourceRow[]).map(mapResource);
}

export async function getResourcesForGrade(grade: string): Promise<Resource[]> {
  const resources = await listResources();
  return resources.filter((r) => r.grade === grade);
}

export async function addResource(input: Omit<Resource, "id" | "createdAt">): Promise<Resource> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("institute_id")
    .eq("id", user.id)
    .single();
  if (profileError || !profile) throw new Error("Could not resolve the caller's institute.");

  const { data, error } = await supabase
    .from("resources")
    .insert({
      title: input.title,
      subject: input.subject,
      grade: input.grade,
      type: input.type,
      url: input.url,
      uploaded_by: user.id,
      institute_id: profile.institute_id,
    })
    .select(RESOURCE_SELECT)
    .single();
  if (error) throw new Error(`Failed to add resource: ${error.message}`, { cause: error });
  return mapResource(data as ResourceRow);
}
