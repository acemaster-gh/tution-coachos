import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { enrollStudent, EnrollmentError } from "@/lib/enrollment";
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

  try {
    const result = await enrollStudent(parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof EnrollmentError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[enroll] unexpected failure", err);
    return NextResponse.json({ error: "Enrollment failed unexpectedly." }, { status: 500 });
  }
}
