"use server";
import { api } from "@/lib/api";

export async function changePasswordAction(_prev: { error?: string; ok?: boolean }, formData: FormData) {
  const current = String(formData.get("currentPassword"));
  const next = String(formData.get("newPassword"));
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  try {
    await api.changePassword(current, next);
    return { ok: true };
  } catch {
    return { error: "Current password is incorrect." };
  }
}
