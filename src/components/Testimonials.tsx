import { siteConfig } from "@/config/site";

export default function Testimonials() {
  return (
    <section id="results" className="border-b border-rule-line bg-paper-raised">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl md:text-4xl font-semibold mb-10">
          What the report card doesn&apos;t say, parents hear from us first.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {siteConfig.testimonials.map((t) => (
            <figure key={t.name} className="rounded-sm border border-rule-line bg-paper p-6">
              <span className="font-display text-4xl text-red-pen leading-none">&ldquo;</span>
              <blockquote className="text-ink mt-1">{t.quote}</blockquote>
              <figcaption className="mt-4 text-sm text-ink-soft">
                <span className="font-medium text-ink">{t.name}</span> — {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
