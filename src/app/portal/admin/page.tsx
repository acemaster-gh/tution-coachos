import type { Metadata } from "next";
import { summarizeFees } from "@/lib/fees";
import { listStudents, getStudentStatus } from "@/lib/students";
import { readCollection, listUsers } from "@/lib/db";
import EnrollLeadForm from "@/components/EnrollLeadForm";
import type { Lead } from "@/lib/types";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Admin Dashboard — ${siteConfig.instituteName}`,
};

export default async function AdminPortal() {
  const [feeSummary, students, leads, users] = await Promise.all([
    summarizeFees(),
    listStudents(),
    readCollection<Lead>("leads.json"),
    listUsers(),
  ]);

  const tutors       = users.filter((u) => u.role === "tutor").map((u) => ({ id: u.id, name: u.name }));
  const flaggedCount = students.filter((s) => getStudentStatus(s).flagged).length;
  const onTrackCount = students.length - flaggedCount;
  const oneWeekAgo   = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentLeads  = [...leads].filter((l) => new Date(l.receivedAt).getTime() >= oneWeekAgo).reverse();
  const pendingLeads = recentLeads.filter((l) => !l.converted);

  const cards = [
    {
      label:  "New enquiries",
      value:  String(recentLeads.length),
      note:   recentLeads.length > 0 ? `${pendingLeads.length} pending enrolment` : "none this week",
      accent: "accent-blue",
      icon:   "📋",
      gradColor: "rgba(37,99,235,0.08)",
    },
    {
      label:  "Fees overdue",
      value:  `₹${feeSummary.overdueAmount.toLocaleString("en-IN")}`,
      note:   `${feeSummary.overdueCount} ${feeSummary.overdueCount === 1 ? "student" : "students"}`,
      accent: "accent-red",
      icon:   "💳",
      gradColor: "rgba(193,68,45,0.08)",
    },
    {
      label:  "Needs attention",
      value:  String(flaggedCount),
      note:   `${onTrackCount} on track`,
      accent: flaggedCount > 0 ? "accent-amber" : "accent-green",
      icon:   flaggedCount > 0 ? "⚠️" : "✅",
      gradColor: flaggedCount > 0 ? "rgba(217,119,6,0.08)" : "rgba(22,163,74,0.08)",
    },
  ];

  return (
    <div>
      {/* Page heading */}
      <div className="mb-8">
        <span className="section-label">at a glance</span>
        <h1 className="font-display text-3xl font-semibold text-ink mt-1">
          Admin dashboard
        </h1>
        <p className="text-ink-soft text-sm mt-1">
          Live data from <strong className="text-ink">{students.length}</strong> students · <strong className="text-ink">{tutors.length}</strong> tutors
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className={`stat-card ${c.accent} animate-fade-in-up`}
            style={{ animationDelay: `${i * 0.08}s` }}
            data-icon={c.icon}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
              style={{ background: c.gradColor }}
            >
              {c.icon}
            </div>
            <p className="font-display text-4xl font-bold text-ink leading-none">{c.value}</p>
            <p className="text-sm font-semibold text-ink mt-2">{c.label}</p>
            <p className="text-xs text-ink-muted mt-1">{c.note}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mb-10">
        <a
          href="/api/alerts/check"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-soft rounded-lg border border-rule-line hover:border-ink hover:text-ink transition-all bg-paper-card hover:bg-paper-raised"
        >
          🔔 Run alert check
        </a>
        <a
          href="/api/billing/reminders"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-soft rounded-lg border border-rule-line hover:border-ink hover:text-ink transition-all bg-paper-card hover:bg-paper-raised"
        >
          📤 Send fee reminders
        </a>
        <a
          href="/portal/admin/notifications"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-soft rounded-lg border border-rule-line hover:border-ink hover:text-ink transition-all bg-paper-card hover:bg-paper-raised"
        >
          📋 Notification log →
        </a>
      </div>

      {/* Recent enquiries */}
      {recentLeads.length > 0 && (
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-ink">Recent enquiries</p>
              <p className="text-xs text-ink-muted">Last 7 days</p>
            </div>
            {pendingLeads.length > 0 && (
              <span className="badge badge-amber">{pendingLeads.length} pending</span>
            )}
          </div>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(201,194,174,0.5)", background: "var(--paper-card)" }}
          >
            {recentLeads.map((l, idx) => (
              <div
                key={l.id}
                className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-paper transition-colors"
                style={{ borderTop: idx > 0 ? "1px solid var(--rule-faint)" : "none" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: "linear-gradient(135deg, var(--blue) 0%, #60a5fa 100%)" }}
                  >
                    {l.parentName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-ink text-sm truncate">{l.parentName}</p>
                    <p className="text-xs text-ink-soft mt-0.5">
                      Class {l.grade} · {l.subject} · {l.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-ink-muted hidden sm:block">
                    {new Date(l.receivedAt).toLocaleDateString("en-IN")}
                  </span>
                  {l.converted ? (
                    <span className="badge badge-green">Enrolled ✓</span>
                  ) : tutors.length > 0 ? (
                    <EnrollLeadForm
                      leadId={l.id}
                      parentName={l.parentName}
                      grade={l.grade}
                      subject={l.subject}
                      tutors={tutors}
                    />
                  ) : (
                    <span className="badge badge-muted">Add tutor first</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flagged students */}
      {flaggedCount > 0 && (
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-2 mb-4">
            <p className="font-semibold text-ink">Flagged students</p>
            <span className="badge badge-red">{flaggedCount}</span>
          </div>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(193,68,45,0.2)", background: "var(--paper-card)" }}
          >
            {students
              .filter((s) => getStudentStatus(s).flagged)
              .map((s, idx) => {
                const status = getStudentStatus(s);
                return (
                  <div
                    key={s.id}
                    className="px-5 py-4 flex items-center justify-between gap-4"
                    style={{ borderTop: idx > 0 ? "1px solid var(--rule-faint)" : "none" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, var(--red-pen), #d4543c)" }}
                      >
                        {s.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-ink text-sm">{s.name}</p>
                        <p className="text-xs text-ink-soft mt-0.5">Class {s.grade}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {status.reasons.map((r: string) => (
                        <span key={r} className="badge badge-red">{r}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Info box */}
      <div
        className="rounded-xl p-5 text-sm text-ink-soft"
        style={{ border: "1px dashed rgba(201,194,174,0.7)", background: "rgba(255,255,255,0.4)" }}
      >
        <p className="font-semibold text-ink mb-1.5 flex items-center gap-1.5">
          <span>ℹ️</span> About the data
        </p>
        Fees and flags are computed live from{" "}
        <code className="bg-paper px-1.5 py-0.5 rounded text-xs font-mono">data/students.json</code>{" "}
        and{" "}
        <code className="bg-paper px-1.5 py-0.5 rounded text-xs font-mono">data/fees.json</code>.
        Payments run through Razorpay once{" "}
        <code className="bg-paper px-1.5 py-0.5 rounded text-xs font-mono">RAZORPAY_KEY_ID/SECRET</code>{" "}
        are set in <code className="bg-paper px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code>.
      </div>
    </div>
  );
}
