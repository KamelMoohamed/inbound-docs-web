"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links: [string, string][] = [
  ["/", "Review"],
  ["/upload", "Upload"],
  ["/roster", "Roster"],
  ["/dashboard", "Dashboard"],
  ["/org", "Org"],
  ["/review/failed", "Failed"],
  ["/billing", "Billing"],
  ["/channels", "Channels"],
  ["/settings", "Settings"],
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1">
      {links.map(([href, label]) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-4 text-sm font-medium transition-colors ${
              active
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
