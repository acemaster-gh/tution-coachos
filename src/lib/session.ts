import { createClient } from "@/utils/supabase/server";
import type { SessionPayload } from "./types";

/**
 * Replaces the old JWT-cookie session reader. Same return shape as
 * before ({ sub, name, role }) so every page/route that calls
 * getSession() needs zero changes — only the implementation moved from
 * "decode our own JWT" to "ask Supabase who's logged in, then look up
 * their role in public.users".
 */
export async function getSession(): Promise<SessionPayload | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return { sub: user.id, name: profile.name, role: profile.role };
}
