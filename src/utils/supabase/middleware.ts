import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session (if needed) and returns the
 * request-scoped client + response + current user. This is Supabase's
 * documented pattern for keeping SSR sessions alive — auth tokens expire
 * and need silent refreshing on the server, and this is where that
 * happens on every request.
 *
 * IMPORTANT (per Supabase's own docs): don't add logic between
 * createServerClient() and supabase.auth.getUser() below — doing so can
 * cause hard-to-debug random logouts, because getUser() is what actually
 * triggers the refresh.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user, supabase };
}
