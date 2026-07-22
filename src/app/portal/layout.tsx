import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { siteConfig } from "@/config/site";
import LogoutButton from "@/components/LogoutButton";

const NAV_LABEL: Record<string, string> = {
  admin: "Admin",
  tutor: "Tutor",
  parent: "Parent",
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  // Middleware already guards this, but keep the page honest on its own too.
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="border-b border-rule-line bg-paper-raised">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-semibold leading-tight">{siteConfig.instituteName}</p>
            <p className="text-xs text-ink-soft uppercase tracking-wide">
              {NAV_LABEL[session.role] ?? session.role} portal — {session.name}
            </p>
          </div>
          <nav className="flex items-center gap-6">
            <a href={`/portal/${session.role}`} className="text-sm font-medium text-ink-soft hover:text-ink transition-colors">
              Dashboard
            </a>
            <a href="/portal/library" className="text-sm font-medium text-ink-soft hover:text-ink transition-colors">
              Library
            </a>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-10">{children}</main>
    </div>
  );
}
