import { siteConfig } from "@/config/site";

export default function Stats() {
  return (
    <section className="border-b border-rule-line">
      <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {siteConfig.stats.map((s) => (
          <div key={s.label} className="text-center sm:text-left">
            <p className="font-display text-4xl font-semibold text-ink">{s.value}</p>
            <p className="text-sm text-ink-soft mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
