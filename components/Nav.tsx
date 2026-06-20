"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links: [string, string][] = [
  ["/", "Review"],
  ["/upload", "Upload"],
  ["/roster", "Roster"],
  ["/dashboard", "Dashboard"],
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="flex items-center gap-1 border-b border-slate-200 bg-white px-6 py-3 text-sm font-medium">
      <span className="mr-4 font-semibold text-slate-900">Inbound Docs</span>
      {links.map(([href, label]) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded px-3 py-1.5 ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
