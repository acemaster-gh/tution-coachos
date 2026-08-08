import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getUserByEmail, updateCollectionItem } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { User } from "@/lib/types";

export async function POST(request: NextRequest) {
  // Verify session from cookie
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Both current password and new password are required." },
      { status: 400 }
    );
  }

  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters." },
      { status: 400 }
    );
  }

  // Find the user by session sub (id) — we need their email for lookup
  const { listUsers } = await import("@/lib/db");
  const users = await listUsers();
  const user = users.find((u) => u.id === session.sub);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Verify current password
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 403 }
    );
  }

  // Hash new password and update
  const newHash = await bcrypt.hash(newPassword, 10);

  await updateCollectionItem<User>(
    "users.json",
    (u) => u.id === session.sub,
    (u) => ({ ...u, passwordHash: newHash })
  );

  return NextResponse.json({ ok: true, message: "Password updated." });
}
