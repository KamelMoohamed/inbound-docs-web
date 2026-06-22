"use server";
import { api } from "@/lib/api";

export async function resendVerificationAction(): Promise<{ ok?: boolean; error?: string } | null> {
  try {
    await api.resendVerification();
    return { ok: true };
  } catch {
    return { error: "Could not send verification email." };
  }
}
