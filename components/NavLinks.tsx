"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavMenu, NavMenuItem } from "./NavMenu";

// Primary daily-workflow links shown directly in the header.
const primary: [string, string][] = [
  ["/upload", "Upload"],
  ["/roster", "Patients"],
  ["/dashboard", "Dashboard"],
  ["/reports", "Reports"],
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1">
      {/* Review groups the inbox + its secondary queues. */}
      <NavMenu label="Review" activePrefixes={["/inbox", "/review"]}>
        <NavMenuItem href="/inbox" label="Inbox" />
        <NavMenuItem href="/review/failed" label="Failed" />
        <NavMenuItem href="/review/held" label="Held" />
      </NavMenu>

      {primary.map(([href, label]) => {
        const active = pathname === href || pathname.startsWith(href + "/");
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
