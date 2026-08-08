import { siteConfig } from "@/config/site";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-6 py-20 text-center">
      {/* Ruled background decoration */}
      <div className="absolute inset-0 ruled-bg opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-md">
        {/* Big 404 */}
        <p className="font-display text-[8rem] font-bold leading-none text-rule-line select-none mb-2">
          404
        </p>

        <span className="font-marginalia text-2xl text-red-pen -rotate-2 block mb-4">
          page not found
        </span>

        <h1 className="font-display text-2xl font-semibold text-ink mb-3">
          We can&apos;t find that page.
        </h1>
        <p className="text-ink-soft text-sm leading-relaxed mb-8">
          The page you&apos;re looking for may have been moved or doesn&apos;t exist.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <a href="/" className="btn-primary">
            ← Back to {siteConfig.instituteName}
          </a>
          <a href="/login" className="btn-outline">
            Portal login
          </a>
        </div>
      </div>
    </div>
  );
}
