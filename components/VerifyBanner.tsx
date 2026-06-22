import { api } from "@/lib/api";
import { VerifyBannerInner } from "./VerifyBannerInner";

export async function VerifyBanner() {
  let profile;
  try { profile = await api.me(); } catch { return null; }
  return <VerifyBannerInner emailVerified={profile.emailVerified} />;
}
