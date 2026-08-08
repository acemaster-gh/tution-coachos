import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listResources, addResource } from "@/lib/resources";
import { logAuditEvent } from "@/lib/audit";

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

  let body: { title?: string; subject?: string; grade?: string; type?: string; url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { title, subject, grade, type, url } = body;
  if (!title || !subject || !grade || !type || !url) {
    return NextResponse.json({ error: "Title, subject, grade, type, and url are all required." }, { status: 400 });
  }
  if (!["notes", "video", "practice"].includes(type)) {
    return NextResponse.json({ error: "Type must be notes, video, or practice." }, { status: 400 });
  }

  const resource = await addResource({
    title,
    subject,
    grade,
    type: type as "notes" | "video" | "practice",
    url,
    uploadedBy: session.sub,
  });

  logAuditEvent({
    userId: session.sub, userName: session.name, role: session.role,
    action: "add_resource", target: resource.id,
    detail: `Added ${type} resource "${title}" for Class ${grade} ${subject}.`,
  }).catch(() => {});

  return NextResponse.json({ ok: true, resource });
}
