import type { Metadata } from "next";
import { readCollection } from "@/lib/db";
import type { NotificationLogEntry } from "@/lib/types";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Notifications — ${siteConfig.instituteName}`,
};

const CHANNEL_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  email:    { label: "Email",    icon: "✉️", color: "var(--blue)",    bg: "rgba(37,99,235,0.08)"  },
  whatsapp: { label: "WhatsApp", icon: "💬", color: "var(--green)",   bg: "rgba(22,163,74,0.08)"  },
  sms:      { label: "SMS",      icon: "📱", color: "var(--amber)",   bg: "rgba(217,119,6,0.08)"  },
};

export default async function NotificationsLog() {
  const all    = await readCollection<NotificationLogEntry>("notifications.json");
  const recent = [...all].sort((a, b) => b.sentAt.localeCompare(a.sentAt)).slice(0, 100);

  const ok    = recent.filter((n) => n.ok).length;
  const failed = recent.filter((n) => !n.ok).length;

  return (
    <div>
      {/* Back link */}
      <a
        href="/portal/admin"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to dashboard
      </a>

      {/* Heading */}
      <div className="mb-8">
        <span className="section-label">audit trail</span>
        <h1 className="font-display text-3xl font-semibold text-ink mt-1">Notifications sent</h1>
        <p className="text-sm text-ink-soft mt-1">
          Last {recent.length} of {all.length} total automated messages.
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="badge badge-muted">{recent.length} total</span>
        {ok > 0 && <span className="badge badge-green">✓ {ok} delivered</span>}
        {failed > 0 && <span className="badge badge-red">✕ {failed} failed</span>}
      </div>

      {recent.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: "var(--paper-card)", border: "1px solid rgba(201,194,174,0.5)" }}
        >
          <p className="text-5xl mb-4" aria-hidden>🔔</p>
          <p className="font-display text-xl font-semibold text-ink mb-2">No notifications sent yet</p>
          <p className="text-ink-soft text-sm">
            Run an alert check from the admin dashboard to trigger automatic notifications.
          </p>
          <a href="/api/alerts/check" className="btn-primary mt-6 inline-flex">
            Run alert check →
          </a>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(201,194,174,0.5)", background: "var(--paper-card)" }}
        >
          {recent.map((n, idx) => {
            const meta = CHANNEL_META[n.channel] ?? { label: n.channel, icon: "📬", color: "var(--ink-soft)", bg: "rgba(201,194,174,0.15)" };
            return (
              <div
                key={n.id}
                className="px-5 py-4"
                style={{ borderTop: idx > 0 ? "1px solid var(--rule-faint)" : "none" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Channel badge */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 mt-0.5"
                      style={{ background: meta.bg }}
                    >
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="text-xs font-bold uppercase tracking-wider"
                          style={{ color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        {!n.ok && (
                          <span className="badge badge-red" style={{ fontSize: "0.6rem" }}>Failed</span>
                        )}
                        {n.ok && (
                          <span className="badge badge-green" style={{ fontSize: "0.6rem" }}>Sent ✓</span>
                        )}
                      </div>
                      <p className="text-xs text-ink-muted mb-1">To: <span className="text-ink">{n.to}</span></p>
                      {n.subject && (
                        <p className="text-sm font-semibold text-ink mb-1">{n.subject}</p>
                      )}
                      <p className="text-sm text-ink-soft leading-relaxed">{n.body}</p>
                      {!n.ok && n.error && (
                        <p className="text-xs text-red-pen mt-1">Error: {n.error}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-ink-muted shrink-0 mt-1 whitespace-nowrap">
                    {new Date(n.sentAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {" "}
                    {new Date(n.sentAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
