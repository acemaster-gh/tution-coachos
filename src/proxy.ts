import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

// ─────────────────────────────────────────────────────────────────────────────
// Routes that DON'T require authentication:
//   /api/auth/*     — login/logout
//   /api/lead       — public enquiry form
// Everything else under /portal/* and /api/* requires a valid session.
// ─────────────────────────────────────────────────────────────────────────────

const PUBLIC_API_PREFIXES = ["/api/auth/", "/api/lead"];

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some(
    (prefix) => pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Public API routes — skip auth ──────────────────────────────────────
  if (isPublicApi(pathname)) {
    return NextResponse.next();
  }

  // ── All protected routes need a session ─────────────────────────────────
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // ── Protected API routes — return 401 JSON, don't redirect ─────────────
  if (pathname.startsWith("/api/")) {
    if (!session) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // Admin-only API routes
    if (pathname.startsWith("/api/admin/") && session.role !== "admin") {
      return Response.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // ── Portal page routes — redirect to login if no session ───────────────
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Routes every signed-in role can see, regardless of their own subpath.
  const SHARED_PATHS = ["/portal/library", "/portal/settings"];

  // Keep tutors out of the admin area and vice versa. Each role only
  // ever lands on its own subpath (plus the shared paths above);
  // /portal itself redirects below.
  const role = session.role as string;
  const isShared = SHARED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isShared && pathname.startsWith("/portal/") && pathname !== `/portal/${role}` && !pathname.startsWith(`/portal/${role}/`)) {
    return NextResponse.redirect(new URL(`/portal/${role}`, request.url));
  }

  if (pathname === "/portal") {
    return NextResponse.redirect(new URL(`/portal/${role}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal", "/portal/:path*", "/api/:path*"],
};
