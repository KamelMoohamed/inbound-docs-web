import Link from "next/link";
import { CTA } from "./CTA";
import { Brand } from "@/components/Brand";

const nav = [
  ["/pricing", "Pricing"],
  ["/customers", "Customers"],
  ["/integrations", "Integrations"],
  ["/security", "Security"],
  ["/faq", "FAQ"],
  ["/contact", "Contact"],
];

export function MarketingHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Brand href="/" iconSize={28} textClass="text-lg" />
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map(([href, label]) => (
            <Link key={href} href={href} className="text-sm font-medium text-slate-600 hover:text-slate-900">{label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Log in</Link>
          <CTA href="/signup">Start free</CTA>
        </div>
      </div>
    </header>
  );
}
