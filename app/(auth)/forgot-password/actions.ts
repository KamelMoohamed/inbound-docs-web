"use server";
import { publicApi } from "@/lib/api";

export async function forgotAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  try {
    await publicApi.forgotPassword(formData.get("email") as string);
  } catch {
    // always returns ok — don't reveal whether email exists
  }
  return null;
}
