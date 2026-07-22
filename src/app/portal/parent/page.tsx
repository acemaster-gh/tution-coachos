import { getSession } from "@/lib/session";
import { getStudentByParent, getStudentStatus, attendancePercent } from "@/lib/students";
import { getFeesByStudent, getEffectiveStatus } from "@/lib/fees";
import DashboardPreview from "@/components/DashboardPreview";
import PayFeeButton from "@/components/PayFeeButton";

export default async function ParentPortal() {
  const session = await getSession();
  const student = session ? await getStudentByParent(session.sub) : undefined;

  if (!student) {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold mb-4">No student on file</h1>
        <p className="text-ink-soft">Get in touch with the front desk to link your account to your child&apos;s record.</p>
      </div>
    );
  }

  const status = getStudentStatus(student);
  const latestScore = student.scores.at(-1);
  const fees = await getFeesByStudent(student.id);
  const feesWithStatus = await Promise.all(
    fees.map(async (f) => ({ ...f, effectiveStatus: await getEffectiveStatus(f) }))
  );
  const nextDue = feesWithStatus.find((f) => f.effectiveStatus !== "paid");

  return (
    <div>
      <p className="font-marginalia text-2xl text-red-pen -rotate-1">your child</p>
      <h1 className="font-display text-3xl font-semibold mb-8">{student.name.split(" ")[0]}&apos;s progress</h1>

      <DashboardPreview
        studentName={student.name}
        subjectLabel={latestScore?.subject ?? "—"}
        weekLabel={`${student.scores.length} tests logged`}
        scores={student.scores}
        attendancePct={attendancePercent(student)}
        feeStatus={nextDue ? nextDue.effectiveStatus : "paid"}
        annotation={status.flagged ? `flag: ${status.reasons.join(", ")}` : ""}
        showMarginalia={false}
      />

      {nextDue && (
        <div className="mt-6 rounded-sm border border-rule-line bg-paper-raised p-5 max-w-md flex items-center justify-between">
          <div>
            <p className="font-medium text-ink">
              ₹{nextDue.amount.toLocaleString("en-IN")} {nextDue.effectiveStatus === "overdue" ? "overdue" : "due"}
            </p>
            <p className="text-sm text-ink-soft">Due {new Date(nextDue.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</p>
          </div>
          <PayFeeButton feeId={nextDue.id} amount={nextDue.amount} />
        </div>
      )}

      <div className="mt-6 rounded-sm border border-dashed border-rule-line p-6 text-sm text-ink-soft max-w-md">
        This is the same live-data view your tutor and the front desk see —
        nothing about your child&apos;s progress is hidden behind a report card
        that only comes home once a term.
      </div>
    </div>
  );
}
