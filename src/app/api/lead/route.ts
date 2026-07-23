import { NextResponse } from "next/server";
import { addLead } from "@/lib/leads";
import { notifyAdminOfNewLead } from "@/lib/messaging";
import { leadSchema, firstIssueMessage } from "@/lib/validation";

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "The enquiry data was malformed." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  const lead = await addLead(parsed.data);
  await notifyAdminOfNewLead(lead);

  return NextResponse.json({ ok: true });
}
