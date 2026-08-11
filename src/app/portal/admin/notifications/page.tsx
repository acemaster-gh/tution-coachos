import { listNotifications } from "@/lib/notifications";

const CHANNEL_LABEL: Record<string, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS",
};

export default async function NotificationsLog() {
  const recent = await listNotifications(100);

  return (
    <div>
      <a href="/portal/admin" className="text-sm text-ink-soft hover:text-ink transition-colors">&larr; Back to dashboard</a>
      <p className="font-marginalia text-2xl text-red-pen -rotate-1 mt-3">audit trail</p>
      <h1 className="font-display text-3xl font-semibold mb-2">Notifications sent</h1>
      <p className="text-sm text-ink-soft mb-8">
        Last {recent.length}. Every automated message — real or logged-only when
        providers aren&apos;t configured — is recorded here.
      </p>

      {recent.length === 0 ? (
        <p className="text-ink-soft">Nothing sent yet.</p>
      ) : (
        <div className="rounded-sm border border-rule-line bg-paper-raised divide-y divide-rule-line">
          {recent.map((n) => (
            <div key={n.id} className="px-5 py-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft border border-rule-line rounded-sm px-2 py-0.5">
                  {CHANNEL_LABEL[n.channel] ?? n.channel}
                </span>
                <span className="text-xs text-ink-soft">{new Date(n.sentAt).toLocaleString("en-IN")}</span>
              </div>
              <p className="text-sm text-ink"><span className="text-ink-soft">To:</span> {n.to}</p>
              {n.subject && <p className="text-sm font-medium text-ink mt-1">{n.subject}</p>}
              <p className="text-sm text-ink-soft mt-1">{n.body}</p>
              {!n.ok && <p className="text-sm text-red-pen mt-1">Failed: {n.error}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
