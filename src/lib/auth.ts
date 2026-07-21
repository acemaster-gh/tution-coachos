import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { SessionPayload } from "./types";

export const SESSION_COOKIE = "coachos_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hour session

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // Dev-only fallback so `npm run dev` works out of the box. Set
    // SESSION_SECRET in .env.local before deploying anywhere real.
    return new TextEncoder().encode("dev-only-insecure-secret-change-me");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
