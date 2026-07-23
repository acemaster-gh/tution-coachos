import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { enrollStudent } from "@/lib/enrollment";
import { emailExists } from "@/lib/users";
import { enrollSchema, firstIssueMessage } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Only admins can enroll students." }, { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = enrollSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  if (await emailExists(parsed.data.parentEmail)) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const result = await enrollStudent(parsed.data);
  return NextResponse.json({ ok: true, ...result });
}
