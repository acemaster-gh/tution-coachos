import { NextResponse } from "next/server";
import { runAlertCheck } from "@/lib/alerts";

export async function GET() {
  const result = await runAlertCheck();
  return NextResponse.json(result);
}
