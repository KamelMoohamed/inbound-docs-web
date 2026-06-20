import Link from "next/link";
import { api } from "@/lib/api";
import { creditTone } from "@/lib/format";

export async function CreditPill() {
  let balance = 0;
  try { balance = (await api.billingSummary()).balance; } catch { return null; }
  const tone = creditTone(balance);
  const cls = tone === "danger" ? "bg-red-100 text-red-800"
    : tone === "warn" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800";
  return (
    <Link href="/billing" className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {balance.toLocaleString()} credits
    </Link>
  );
}
