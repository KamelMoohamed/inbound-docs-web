import Link from "next/link";
import { api } from "@/lib/api";

export async function LowCreditBanner() {
  let summary;
  try { summary = await api.billingSummary(); } catch { return null; }
  if (summary.balance > 100 && summary.held === 0) return null;
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-sm text-amber-800">
      {summary.held > 0
        ? <>⏸ {summary.held} document(s) are <strong>held</strong>, waiting for credits — they&apos;ll process automatically once you top up. </>
        : <>⚠ Low credit balance ({summary.balance}). </>}
      <Link href="/billing" className="font-semibold underline">Add credits</Link>
    </div>
  );
}
