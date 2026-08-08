"use client";

import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export function PortalNavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <a
            key={item.href}
            href={item.href}
            className={`sidebar-link ${isActive ? "active" : ""}`}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

export function PortalMobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="md:hidden mobile-tab-bar">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <a
            key={item.href}
            href={item.href}
            className={isActive ? "active" : ""}
          >
            <span className="tab-icon" aria-hidden>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        );
      })}
    </div>
  );
}

export function PortalGreeting({ name }: { name: string }) {
  const hour = new Date().getHours();
  let greeting: string;
  if (hour < 12) greeting = "Good morning";
  else if (hour < 17) greeting = "Good afternoon";
  else greeting = "Good evening";

  const firstName = name.split(" ")[0];

  return (
    <p className="text-sm text-ink-soft">
      {greeting}, <span className="font-semibold text-ink">{firstName}</span>
    </p>
  );
}
