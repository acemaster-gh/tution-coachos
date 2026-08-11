import { createAdminClient } from "@/utils/supabase/admin";
import type { NotificationChannel, NotificationLogEntry } from "./types";

interface SendResult {
  ok: boolean;
  error?: string;
}

async function sendEmail(to: string, subject: string, body: string): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.log(`[email:unconfigured] to=${to} subject="${subject}"\n${body}`);
    return { ok: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({ from, to, subject, text: body });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown email error" };
  }
}

async function sendTwilio(to: string, body: string, channel: "whatsapp" | "sms"): Promise<SendResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = channel === "whatsapp" ? process.env.TWILIO_WHATSAPP_FROM : process.env.TWILIO_SMS_FROM;

  if (!sid || !token || !from) {
    console.log(`[${channel}:unconfigured] to=${to}\n${body}`);
    return { ok: true };
  }

  try {
    const twilioModule = await import("twilio");
    const client = twilioModule.default(sid, token);
    const toAddress = channel === "whatsapp" ? `whatsapp:${to}` : to;
    const fromAddress = channel === "whatsapp" ? `whatsapp:${from}` : from;
    await client.messages.create({ to: toAddress, from: fromAddress, body });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown Twilio error" };
  }
}

interface NotifyOptions {
  to: string;
  channel: NotificationChannel;
  body: string;
  subject?: string;
}

/**
 * Sends through the configured provider, falls back to a console-logged
 * dry run if unconfigured, and always records the attempt via the ADMIN
 * client — there's deliberately no INSERT policy on `notifications` for
 * regular users; it's a system-written audit log, never user-writable.
 */
export async function notify({ to, channel, body, subject }: NotifyOptions): Promise<SendResult> {
  let result: SendResult;

  if (channel === "email") {
    result = await sendEmail(to, subject ?? "Notification", body);
  } else {
    result = await sendTwilio(to, body, channel);
  }

  const instituteId = process.env.INSTITUTE_ID;
  if (instituteId) {
    const admin = createAdminClient();
    const { error } = await admin.from("notifications").insert({
      institute_id: instituteId,
      channel,
      recipient: to,
      subject,
      body,
      ok: result.ok,
      error: result.error,
    });
    if (error) console.error("[notifications] failed to write audit log entry:", error.message);
  } else {
    console.warn("[notifications] INSTITUTE_ID not set — skipping audit log write.");
  }

  return result;
}

interface NotificationRow {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string | null;
  body: string;
  sent_at: string;
  ok: boolean;
  error: string | null;
}

function mapNotification(row: NotificationRow): NotificationLogEntry {
  return {
    id: row.id,
    channel: row.channel,
    to: row.recipient,
    subject: row.subject ?? undefined,
    body: row.body,
    sentAt: row.sent_at,
    ok: row.ok,
    error: row.error ?? undefined,
  };
}

/** Admin-only read, via the caller's own RLS-scoped session (not the admin client). */
export async function listNotifications(limit = 100): Promise<NotificationLogEntry[]> {
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, channel, recipient, subject, body, sent_at, ok, error")
    .order("sent_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to list notifications: ${error.message}`, { cause: error });
  return (data as NotificationRow[]).map(mapNotification);
}
