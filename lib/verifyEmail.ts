import { publicApi } from "@/lib/api";

export function verifyEmailError() {
  return { error: "Verification link is invalid or expired." as const };
}

export async function verifyEmail(token: string) {
  try {
    await publicApi.verifyEmail(token);
    return { ok: true as const };
  } catch {
    return verifyEmailError();
  }
}
