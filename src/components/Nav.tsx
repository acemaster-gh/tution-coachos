import { siteConfig } from "@/config/site";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule-line bg-paper/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <a href="#top" className="font-display text-xl font-semibold tracking-tight">
          {siteConfig.instituteName}
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-soft">
          <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
          <a href="#results" className="hover:text-ink transition-colors">Results</a>
          <a href="#enquire" className="hover:text-ink transition-colors">Enquire</a>
        </nav>
        <a
          href={`tel:${siteConfig.phone}`}
          className="rounded-sm bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-red-pen transition-colors"
        >
          Call {siteConfig.phone}
        </a>
      </div>
    </header>
  );
}
