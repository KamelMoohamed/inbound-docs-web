import Link from "next/link";
import { Brand } from "@/components/Brand";

const cols: [string, [string, string][]][] = [
  ["Product", [["/pricing", "Pricing"], ["/integrations", "Integrations"], ["/security", "Security"]]],
  ["Company", [["/about", "About"], ["/contact", "Contact"]]],
  ["Legal", [["/privacy", "Privacy"], ["/terms", "Terms"], ["/dpa", "DPA"], ["/sub-processors", "Sub-processors"]]],
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <Brand href={null} iconSize={26} textClass="text-base" />
          <p className="mt-2 text-sm text-slate-500">Clinical document triage and filing for Australian practices.</p>
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <ul className="mt-3 space-y-2">
              {links.map(([href, label]) => (
                <li key={href}><Link href={href} className="text-sm text-slate-600 hover:text-slate-900">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 px-6 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} CliniDoc. Hosted in Australia.
      </div>
    </footer>
  );
}
