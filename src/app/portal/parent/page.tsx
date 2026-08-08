import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { getStudentByParent, getStudentStatus, attendancePercent } from "@/lib/students";
import { getFeesByStudent, getEffectiveStatus } from "@/lib/fees";
import DashboardPreview from "@/components/DashboardPreview";
import PayFeeButton from "@/components/PayFeeButton";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Progress — ${siteConfig.instituteName}`,
};

export default async function ParentPortal() {
  const session = await getSession();
  const student = session ? await getStudentByParent(session.sub) : undefined;

  if (!student) {
    return (
      <div className="max-w-sm mx-auto mt-8">
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: "var(--paper-card)", border: "1px solid rgba(201,194,174,0.5)", boxShadow: "var(--shadow-md)" }}
        >
          <p className="text-5xl mb-4" aria-hidden>📋</p>
          <h1 className="font-display text-2xl font-semibold text-ink mb-2">No student on file</h1>
          <p className="text-ink-soft text-sm leading-relaxed">
            Get in touch with the front desk to link your account to your child&apos;s record.
          </p>
        </div>
      </div>
    );
  }

  const status     = getStudentStatus(student);
  const latestScore = student.scores.at(-1);
  const fees       = await getFeesByStudent(student.id);
  const feesWithStatus = await Promise.all(
    fees.map(async (f) => ({ ...f, effectiveStatus: await getEffectiveStatus(f) }))
  );
  const nextDue = feesWithStatus.find((f) => f.effectiveStatus !== "paid");
  const allPaid = feesWithStatus.every((f) => f.effectiveStatus === "paid");
  const attPct  = attendancePercent(student);
  const firstName = student.name.split(" ")[0];

  const quickStats = [
    {
      label: "Attendance",
      value: `${attPct}%`,
      note: attPct >= 75 ? "✓ Good standing" : "⚠ Below 75%",
      accent: attPct >= 75 ? "accent-green" : "accent-red",
    },
    {
      label: "Tests logged",
      value: String(student.scores.length),
      note: latestScore ? `Last: ${latestScore.subject}` : "None yet",
      accent: "accent-blue",
    },
    {
      label: "Fee status",
      value: allPaid ? "Paid" : (nextDue?.effectiveStatus ?? "—"),
      note: nextDue ? `₹${nextDue.amount.toLocaleString("en-IN")} due` : "All clear",
      accent: nextDue
        ? nextDue.effectiveStatus === "overdue"
          ? "accent-red"
          : "accent-amber"
        : "accent-green",
    },
    {
      label: "Overall",
      value: status.flagged ? "Flagged" : "On track",
      note: status.flagged ? "Tutor alerted" : "No concerns",
      accent: status.flagged ? "accent-red" : "accent-green",
    },
  ];

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <span className="section-label">your child</span>
        <h1 className="font-display text-3xl font-semibold text-ink mt-1">
          {firstName}&apos;s progress
        </h1>
        <p className="text-ink-soft text-sm mt-1">
          Class {student.grade} · Live data, updated after every class
        </p>
      </div>

      {/* Alert banner */}
      {status.flagged && (
        <div
          className="mb-6 flex items-start gap-3 rounded-xl p-4 animate-fade-in-up"
          style={{ background: "rgba(217,119,6,0.07)", border: "1px solid rgba(217,119,6,0.25)" }}
        >
          <span className="text-amber text-2xl shrink-0 mt-0.5" aria-hidden>⚠️</span>
          <div>
            <p className="font-semibold text-ink text-sm">Heads up</p>
            <p className="text-sm text-ink-soft mt-0.5">
              {firstName} has been flagged: {status.reasons.join(", ")}.
              Your tutor has been notified and will be in touch.
            </p>
          </div>
        </div>
      )}

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {quickStats.map((s, i) => (
          <div
            key={s.label}
            className={`stat-card ${s.accent} animate-fade-in-up`}
            style={{ animationDelay: `${i * 0.08}s`, padding: "1.25rem" }}
          >
            <p className="text-xs text-ink-muted mb-2">{s.label}</p>
            <p className="font-display text-2xl font-bold text-ink capitalize leading-none">{s.value}</p>
            <p className="text-xs text-ink-muted mt-1.5">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Chart — full width on mobile, max-width md */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <p className="font-semibold text-ink mb-4">Progress chart</p>
        <DashboardPreview
          studentName={student.name}
          subjectLabel={latestScore?.subject ?? "—"}
          weekLabel={`${student.scores.length} tests logged`}
          scores={student.scores}
          attendancePct={attPct}
          feeStatus={nextDue ? nextDue.effectiveStatus : "paid"}
          annotation={status.flagged ? `flag: ${status.reasons.join(", ")}` : ""}
          showMarginalia={false}
        />
      </div>

      {/* Fee payment card */}
      {nextDue && (
        <div
          className="mb-8 rounded-xl p-5 flex items-center justify-between gap-4 animate-fade-in-up"
          style={{
            animationDelay: "0.3s",
            background: nextDue.effectiveStatus === "overdue"
              ? "linear-gradient(135deg, rgba(193,68,45,0.06) 0%, var(--paper-card) 60%)"
              : "var(--paper-card)",
            border: nextDue.effectiveStatus === "overdue"
              ? "1px solid rgba(193,68,45,0.25)"
              : "1px solid rgba(201,194,174,0.5)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div>
            <p className="font-semibold text-ink">
              ₹{nextDue.amount.toLocaleString("en-IN")}{" "}
              <span
                className="font-normal capitalize"
                style={{ color: nextDue.effectiveStatus === "overdue" ? "var(--red-pen)" : "var(--amber)" }}
              >
                {nextDue.effectiveStatus}
              </span>
            </p>
            <p className="text-sm text-ink-soft mt-0.5">
              Due {new Date(nextDue.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
            </p>
          </div>
          <PayFeeButton feeId={nextDue.id} amount={nextDue.amount} />
        </div>
      )}

      {/* Info note */}
      <div
        className="rounded-xl p-5 text-sm text-ink-soft max-w-xl animate-fade-in-up"
        style={{ border: "1px dashed rgba(201,194,174,0.7)", background: "rgba(255,255,255,0.4)", animationDelay: "0.4s" }}
      >
        <p className="font-semibold text-ink mb-1 flex items-center gap-1.5">ℹ️ About this view</p>
        This is the same live-data view your tutor sees —
        nothing about {firstName}&apos;s progress is hidden behind a report card
        that only comes home once a term.
      </div>
    </div>
  );
}
