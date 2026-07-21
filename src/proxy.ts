import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Keep tutors out of the admin area and vice versa. Each role only
  // ever lands on its own subpath; /portal itself redirects below.
  const role = session.role as string;
  if (pathname.startsWith("/portal/") && pathname !== `/portal/${role}` && !pathname.startsWith(`/portal/${role}/`)) {
    return NextResponse.redirect(new URL(`/portal/${role}`, request.url));
  }

  if (pathname === "/portal") {
    return NextResponse.redirect(new URL(`/portal/${role}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal", "/portal/:path*"],
};
