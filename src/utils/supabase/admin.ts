import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * DANGER: this client uses the service role key, which bypasses Row Level
 * Security entirely. Never import this into a Client Component or expose
 * it to the browser — it must only ever run in Route Handlers/Server
 * Actions/server-only code.
 *
 * Legitimate uses in this app:
 *  - Creating a parent's auth.users account during enrollment (regular
 *    signUp requires the user's own session; an admin creating an
 *    account on someone else's behalf needs the admin API).
 *  - The Razorpay webhook marking a fee paid (arrives with no user
 *    session at all — it's Razorpay's server calling us, authenticated
 *    by HMAC signature instead of a Supabase session).
 *  - The cron-triggered alert/reminder checks, which also run with no
 *    user session (see src/lib/cronAuth.ts for how those are gated).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set to use the admin client."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
