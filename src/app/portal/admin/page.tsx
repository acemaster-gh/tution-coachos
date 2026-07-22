import { summarizeFees } from "@/lib/fees";
import { listStudents, getStudentStatus } from "@/lib/students";
import { readCollection, listUsers } from "@/lib/db";
import EnrollLeadForm from "@/components/EnrollLeadForm";
import type { Lead } from "@/lib/types";

export default async function AdminPortal() {
  const [feeSummary, students, leads, users] = await Promise.all([
    summarizeFees(),
    listStudents(),
    readCollection<Lead>("leads.json"),
    listUsers(),
  ]);

  const tutors = users.filter((u) => u.role === "tutor").map((u) => ({ id: u.id, name: u.name }));
  const flaggedCount = students.filter((s) => getStudentStatus(s).flagged).length;
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentLeads = [...leads].filter((l) => new Date(l.receivedAt).getTime() >= oneWeekAgo).reverse();

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
        <div className="mb-10">
          <p className="font-medium text-ink mb-3">Recent enquiries</p>
          <div className="rounded-sm border border-rule-line bg-paper-raised divide-y divide-rule-line">
            {recentLeads.map((l) => (
              <div key={l.id} className="px-5 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink">{l.parentName}</p>
                    <p className="text-ink-soft">Class {l.grade} · {l.subject} · {l.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-ink-soft block">{new Date(l.receivedAt).toLocaleDateString("en-IN")}</span>
                    {l.converted ? (
                      <span className="text-xs text-ink-soft">Enrolled ✓</span>
                    ) : tutors.length > 0 ? (
                      <EnrollLeadForm leadId={l.id} parentName={l.parentName} grade={l.grade} subject={l.subject} tutors={tutors} />
                    ) : (
                      <span className="text-xs text-ink-soft">Add a tutor account first</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-sm border border-dashed border-rule-line p-6 text-sm text-ink-soft">
        Fees and flags are computed live from data/students.json and
        data/fees.json. Payments run through Razorpay once
        RAZORPAY_KEY_ID/SECRET are set in .env.local — see README. Fee
        reminders can be triggered manually at{" "}
        <code className="bg-paper px-1 rounded-sm">/api/billing/reminders</code>{" "}
        or scheduled via <code className="bg-paper px-1 rounded-sm">scripts/cron.js</code>.
        See the{" "}
        <a href="/portal/admin/notifications" className="text-red-pen underline">
          full notification log
        </a>.
      </div>
    </div>
  );
}
