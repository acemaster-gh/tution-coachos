import { NextResponse } from "next/server";

/**
 * Gates background-job endpoints (reminders, alert checks) that are meant
 * to be hit by a cron scheduler, not a browser. Returns a NextResponse to
 * send back (unauthorized) if the check fails, or null if the request is
 * allowed to proceed.
 */
export function assertCronAuthorized(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      // Refuse to run wide open in production just because someone forgot
      // to set this — fail loudly instead of silently accepting anyone.
      return NextResponse.json(
        { error: "CRON_SECRET is not configured. This endpoint is disabled until it's set." },
        { status: 503 }
      );
    }
    console.warn("[cron-auth] CRON_SECRET not set — allowing unauthenticated access (dev only).");
    return null;
  }

  const header = request.headers.get("authorization");
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}
