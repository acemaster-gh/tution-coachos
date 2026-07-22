import { summarizeFees } from "@/lib/fees";
import { listStudents, getStudentStatus } from "@/lib/students";
import { readCollection } from "@/lib/db";
import type { Lead } from "@/lib/types";

export default async function AdminPortal() {
  const [feeSummary, students, leads] = await Promise.all([
    summarizeFees(),
    listStudents(),
    readCollection<Lead>("leads.json"),
  ]);

  const flaggedCount = students.filter((s) => getStudentStatus(s).flagged).length;
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentLeads = leads.filter((l) => new Date(l.receivedAt).getTime() >= oneWeekAgo);

  const cards = [
    {
      label: "New enquiries this week",
      value: String(recentLeads.length),
      note: recentLeads.length > 0 ? "from the site's lead form" : "none yet — share the enquiry link",
    },
    {
      label: "Fees overdue",
      value: `₹${feeSummary.overdueAmount.toLocaleString("en-IN")}`,
      note: `across ${feeSummary.overdueCount} ${feeSummary.overdueCount === 1 ? "student" : "students"}`,
    },
    {
      label: "Students flagged",
      value: `${flaggedCount} of ${students.length}`,
      note: "score dip or low attendance",
    },
  ];

  return (
    <div>
      <p className="font-marginalia text-2xl text-red-pen -rotate-1">at a glance</p>
      <h1 className="font-display text-3xl font-semibold mb-8">Admin dashboard</h1>

      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="rounded-sm border border-rule-line bg-paper-raised p-5">
            <p className="font-display text-3xl font-semibold">{c.value}</p>
            <p className="text-sm font-medium text-ink mt-1">{c.label}</p>
            <p className="text-xs text-ink-soft mt-1">{c.note}</p>
          </div>
        ))}
      </div>

      {recentLeads.length > 0 && (
        <div className="rounded-sm border border-rule-line bg-paper-raised divide-y divide-rule-line mb-10">
          {recentLeads.map((l) => (
            <div key={l.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <p className="font-medium text-ink">{l.parentName}</p>
                <p className="text-ink-soft">Class {l.grade} · {l.subject} · {l.phone}</p>
              </div>
              <span className="text-ink-soft">{new Date(l.receivedAt).toLocaleDateString("en-IN")}</span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-sm border border-dashed border-rule-line p-6 text-sm text-ink-soft">
        Fees and flags are computed live from data/students.json and
        data/fees.json. Payments run through Razorpay once
        RAZORPAY_KEY_ID/SECRET are set in .env.local — see README. Fee
        reminders can be triggered manually at{" "}
        <code className="bg-paper px-1 rounded-sm">/api/billing/reminders</code>{" "}
        or scheduled via <code className="bg-paper px-1 rounded-sm">scripts/send-reminders.js</code>.
      </div>
    </div>
  );
}
