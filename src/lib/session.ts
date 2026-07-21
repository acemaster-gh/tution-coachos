import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "./auth";
import type { SessionPayload } from "./types";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
