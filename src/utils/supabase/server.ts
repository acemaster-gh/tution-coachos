import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Reads/writes auth cookies via next/headers, which is
 * what makes SSR session handling work — this is why @supabase/ssr is
 * required instead of the plain @supabase/supabase-js client, which has
 * no concept of Next.js's cookie store.
 *
 * NOTE: cookies().set() throws when called from a Server Component (only
 * Server Actions/Route Handlers/middleware can set cookies) — the
 * try/catch below is the documented way to handle that; the proxy
 * (middleware) is what actually refreshes the session cookie in that case.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — safe to ignore because the
            // proxy (middleware) below refreshes the session on every
            // request anyway.
          }
        },
      },
    }
  );
}
