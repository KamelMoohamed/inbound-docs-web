import { getShellData } from "@/lib/shell";
import { VerifyBannerInner } from "./VerifyBannerInner";
import { BillingBannerInner } from "./BillingBannerInner";
import { LowCreditBannerInner } from "./LowCreditBannerInner";

export async function AppBanners() {
  const shell = await getShellData();
  if (!shell) return null;

  return (
    <>
      {shell.me && <VerifyBannerInner emailVerified={shell.me.emailVerified} />}
      {shell.billing && (
        <BillingBannerInner
          past_due={shell.billing.past_due ?? false}
          grace_until={shell.billing.grace_until}
        />
      )}
      {shell.billing && <LowCreditBannerInner summary={shell.billing} />}
    </>
  );
}
