import Link from "next/link";
const links = [["/", "Review"], ["/upload", "Upload"], ["/roster", "Roster"], ["/dashboard", "Dashboard"]];
export function Nav() {
  return (
    <nav className="flex gap-4 border-b border-slate-200 bg-white px-6 py-3 text-sm font-medium">
      <span className="font-semibold text-slate-900">Inbound Docs</span>
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="text-slate-600 hover:text-slate-900">{label}</Link>
      ))}
    </nav>
  );
}
