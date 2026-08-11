import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    // Supabase distinguishes many failure reasons internally, but
    // exposing which one lets an attacker enumerate valid emails —
    // same deliberately-generic message regardless of cause.
    return NextResponse.json({ error: "No account matches that email and password." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "This account has no profile set up. Contact your institute admin." }, { status: 403 });
  }

  // The Supabase server client sets the session cookies itself as a side
  // effect of signInWithPassword() above (via the cookie adapter in
  // utils/supabase/server.ts) — no manual cookie-setting needed here,
  // unlike the old custom-JWT version of this route.
  return NextResponse.json({ ok: true, role: profile.role });
}
