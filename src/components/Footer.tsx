import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-ink-soft">
        <p>{siteConfig.instituteName} · {siteConfig.address}</p>
        <div className="flex gap-6">
          <a href={`tel:${siteConfig.phone}`} className="hover:text-ink transition-colors">{siteConfig.phone}</a>
          <a href={`mailto:${siteConfig.email}`} className="hover:text-ink transition-colors">{siteConfig.email}</a>
        </div>
      </div>
    </footer>
  );
}
