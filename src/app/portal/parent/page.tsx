import DashboardPreview from "@/components/DashboardPreview";

export default function ParentPortal() {
  return (
    <div>
      <p className="font-marginalia text-2xl text-red-pen -rotate-1">your child</p>
      <h1 className="font-display text-3xl font-semibold mb-8">Aarav&apos;s progress</h1>

      <DashboardPreview />

      <div className="mt-8 rounded-sm border border-dashed border-rule-line p-6 text-sm text-ink-soft max-w-md">
        This is the same live-data view your tutor and the front desk see —
        nothing about your child&apos;s progress is hidden behind a report card
        that only comes home once a term.
      </div>
    </div>
  );
}
