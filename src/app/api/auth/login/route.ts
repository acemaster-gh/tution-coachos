import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db";
import { createSessionToken, verifyPassword, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The login data was malformed." }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Enter both email and password." }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "No account matches that email and password." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "No account matches that email and password." }, { status: 401 });
  }

  const token = await createSessionToken({ sub: user.id, name: user.name, role: user.role });

  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
