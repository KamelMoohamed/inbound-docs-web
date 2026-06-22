import { api } from "@/lib/api";
import { BillingBannerInner } from "./BillingBannerInner";

export async function BillingBanner() {
  let summary;
  try { summary = await api.billingSummary(); } catch { return null; }
  return <BillingBannerInner past_due={summary.past_due ?? false} grace_until={summary.grace_until} />;
}
