import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { siteConfig } from "@/config/site";
import LogoutButton from "@/components/LogoutButton";
import { PortalNavLinks, PortalMobileNav, PortalGreeting } from "@/components/PortalNav";

const NAV_LABEL: Record<string, string> = {
  admin:  "Admin",
  tutor:  "Tutor",
  parent: "Parent",
};

const ROLE_NAV: Record<string, { href: string; label: string; icon: string }[]> = {
  admin: [
    { href: "/portal/admin",               label: "Dashboard",     icon: "📊" },
    { href: "/portal/admin/notifications", label: "Notifications", icon: "🔔" },
    { href: "/portal/library",             label: "Library",       icon: "📚" },
    { href: "/portal/settings",            label: "Settings",      icon: "⚙️" },
  ],
  tutor: [
    { href: "/portal/tutor",    label: "My Students", icon: "👥" },
    { href: "/portal/library",  label: "Library",     icon: "📚" },
    { href: "/portal/settings", label: "Settings",    icon: "⚙️" },
  ],
  parent: [
    { href: "/portal/parent",   label: "Progress",  icon: "📈" },
    { href: "/portal/library",  label: "Library",   icon: "📚" },
    { href: "/portal/settings", label: "Settings",  icon: "⚙️" },
  ],
};

const ROLE_GRADIENTS: Record<string, string> = {
  admin:  "linear-gradient(135deg, var(--red-pen) 0%, #d4543c 100%)",
  tutor:  "linear-gradient(135deg, var(--amber) 0%, #f5b851 100%)",
  parent: "linear-gradient(135deg, var(--green) 0%, #34d399 100%)",
};

function Avatar({ name, role }: { name: string; role: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
      style={{
        background: ROLE_GRADIENTS[role] ?? "linear-gradient(135deg, var(--ink-soft), var(--ink))",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const navItems = ROLE_NAV[session.role] ?? [];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--paper)" }}>
      {/* Top header */}
      <header className="sticky top-0 z-40 portal-header">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <a
            href="/"
            className="font-display text-lg font-semibold shrink-0 transition-opacity duration-200 hover:opacity-75"
            style={{
              background: "linear-gradient(135deg, var(--ink) 0%, var(--ink-soft) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {siteConfig.instituteName}
          </a>

          {/* Desktop nav links */}
          <PortalNavLinks items={navItems} />

          {/* Right: user info + logout */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2.5">
              <Avatar name={session.name} role={session.role} />
              <div className="leading-none">
                <p className="text-sm font-semibold text-ink">{session.name}</p>
                <p className="text-xs text-ink-muted capitalize">{NAV_LABEL[session.role] ?? session.role}</p>
              </div>
            </div>
            <div
              className="w-px h-8 hidden sm:block"
              style={{ background: "rgba(201,194,174,0.5)" }}
            />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Role badge + greeting strip */}
      <div
        className="border-b"
        style={{
          background: "rgba(255,255,255,0.4)",
          borderColor: "rgba(201,194,174,0.35)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Role pill with gradient */}
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white"
              style={{
                background: ROLE_GRADIENTS[session.role] ?? "var(--ink)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }}
            >
              {NAV_LABEL[session.role] ?? session.role} portal
            </span>
          </div>
          <PortalGreeting name={session.name} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-10 pb-24 md:pb-10 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer
        className="py-4 hidden md:block"
        style={{
          borderTop: "1px solid rgba(201,194,174,0.35)",
          background: "rgba(255,255,255,0.3)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between text-xs text-ink-muted">
          <p>{siteConfig.instituteName}</p>
          <a href="/" className="hover:text-ink transition-colors">← Back to site</a>
        </div>
      </footer>

      {/* Mobile bottom tab bar */}
      <PortalMobileNav items={navItems} />
    </div>
  );
}
