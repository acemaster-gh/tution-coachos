import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import type { User } from "./types";

/** Tutors in the caller's own institute — RLS scopes this automatically. */
export async function listTutors(): Promise<Pick<User, "id" | "name">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("users").select("id, name").eq("role", "tutor");
  if (error) throw new Error(`Failed to list tutors: ${error.message}`, { cause: error });
  return data;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("users").select("id, name, email, role").eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to fetch user ${id}: ${error.message}`, { cause: error });
  return data ?? undefined;
}

/**
 * Checks whether an email is already registered — used by the enrollment
 * flow to reject duplicates. Deliberately uses the ADMIN client: emails
 * are unique across the whole Supabase Auth system (not just one
 * institute), and the caller's own RLS-scoped view can't see accounts
 * outside their institute, so checking via the regular client would miss
 * cross-institute collisions entirely.
 */
export async function emailExists(email: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error) throw new Error(`Failed to check email: ${error.message}`, { cause: error });
  return data !== null;
}
