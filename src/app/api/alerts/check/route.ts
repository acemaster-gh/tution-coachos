import { NextResponse } from "next/server";
import { runAlertCheck } from "@/lib/alerts";
import { assertCronAuthorized } from "@/lib/cronAuth";

export async function GET(request: Request) {
  const denied = assertCronAuthorized(request);
  if (denied) return denied;

  const result = await runAlertCheck();
  return NextResponse.json(result);
}
