"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function mfaSetupAction() {
  return api.mfaSetup();
}

export async function mfaVerifyAction(formData: FormData) {
  await api.mfaVerify(String(formData.get("code") ?? ""));
  revalidatePath("/settings/security");
}

export async function mfaDisableAction(formData: FormData) {
  await api.mfaDisable(String(formData.get("code") ?? ""));
  revalidatePath("/settings/security");
}
