import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listResources, addResource } from "@/lib/resources";
import { resourceSchema, firstIssueMessage } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const resources = await listResources();
  return NextResponse.json({ resources });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (session.role !== "tutor" && session.role !== "admin") {
    return NextResponse.json({ error: "Only tutors and admins can add resources." }, { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = resourceSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  const resource = await addResource({ ...parsed.data, uploadedBy: session.sub });

  return NextResponse.json({ ok: true, resource });
}
