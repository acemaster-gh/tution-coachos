import { appendToCollection } from "./db";
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
    return { ok: true }; // "succeeds" as a logged dry-run, not a hard failure
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
  subject?: string; // email only
}

/**
 * Sends through the configured provider for the given channel, falls back
 * to a console-logged dry run if that provider's env vars aren't set, and
 * always records the attempt to data/notifications.json so the admin
 * dashboard has an audit trail regardless of whether real sending is on.
 */
export async function notify({ to, channel, body, subject }: NotifyOptions): Promise<SendResult> {
  let result: SendResult;

  if (channel === "email") {
    result = await sendEmail(to, subject ?? "Notification", body);
  } else {
    result = await sendTwilio(to, body, channel);
  }

  const entry: NotificationLogEntry = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    channel,
    to,
    subject,
    body,
    sentAt: new Date().toISOString(),
    ok: result.ok,
    error: result.error,
  };
  await appendToCollection<NotificationLogEntry>("notifications.json", entry);

  return result;
}
