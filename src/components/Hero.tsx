import { siteConfig } from "@/config/site";
import DashboardPreview from "./DashboardPreview";

export default function Hero() {
  return (
    <section id="top" className="ruled-bg border-b border-rule-line">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-marginalia text-2xl text-red-pen -rotate-1 mb-2">
            {siteConfig.city} · {siteConfig.subjects[0]}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold italic leading-tight text-ink">
            {siteConfig.tagline}
          </h1>
          <p className="mt-5 text-lg text-ink-soft max-w-md">
            {siteConfig.instituteName} tracks every test, every absence, and every
            slipping grade — and tells you about it before the parent has to ask.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#enquire"
              className="rounded-sm bg-red-pen text-paper px-6 py-3 font-medium hover:bg-red-pen-dark transition-colors"
            >
              Book a free trial class
            </a>
            <a
              href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`}
              className="rounded-sm border border-ink px-6 py-3 font-medium hover:bg-ink hover:text-paper transition-colors"
            >
              Message on WhatsApp
            </a>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
