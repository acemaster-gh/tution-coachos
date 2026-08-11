import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// Routes every signed-in role can see, regardless of their own subpath.
const SHARED_PATHS = ["/portal/library"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refreshes the Supabase session cookie on every request — this must
  // run for every matched path, not just /portal, or sessions will
  // silently expire client-side even on pages that don't need auth.
  const { supabaseResponse, user, supabase } = await updateSession(request);

  if (!pathname.startsWith("/portal")) {
    return supabaseResponse;
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role lives in public.users, not in the Supabase auth session itself —
  // one extra lookup per request. (Could be cached in a custom JWT claim
  // later via a Supabase Auth Hook, but that's an optimization, not a
  // correctness requirement.)
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Authenticated with Supabase but no matching profile row — treat as
    // logged out rather than crashing on `profile.role` below.
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = profile.role as string;
  const isShared = SHARED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isShared && pathname !== `/portal/${role}` && !pathname.startsWith(`/portal/${role}/`)) {
    return NextResponse.redirect(new URL(`/portal/${role}`, request.url));
  }

  if (pathname === "/portal") {
    return NextResponse.redirect(new URL(`/portal/${role}`, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match every path except static assets, so the Supabase session
     * cookie gets refreshed everywhere, not just under /portal.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
