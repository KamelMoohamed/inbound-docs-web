import Link from "next/link";
import { creditTone } from "@/lib/format";

export function CreditPill({ balance }: { balance: number }) {
  const tone = creditTone(balance);
  const cls = tone === "danger" ? "bg-red-100 text-red-800"
    : tone === "warn" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800";
  return (
    <Link href="/billing" className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {balance.toLocaleString()} credits
    </Link>
  );
}
