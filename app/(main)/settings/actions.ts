"use server";
import { api } from "@/lib/api";

export type PwState = { error?: string; ok?: boolean };

export async function changePasswordAction(_prev: PwState, formData: FormData): Promise<PwState> {
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

export async function updateNameAction(_prev: { ok?: boolean; error?: string }, formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name cannot be empty." };
  try { await api.updateProfile(name); return { ok: true }; }
  catch { return { error: "Could not update your name." }; }
}
