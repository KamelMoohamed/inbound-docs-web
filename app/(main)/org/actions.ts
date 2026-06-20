"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function inviteAction(formData: FormData) {
  await api.invite(formData.get("email") as string, formData.get("role") as string);
  revalidatePath("/org");
}
export async function setRoleAction(userId: string, role: string) {
  await api.setRole(userId, role);
  revalidatePath("/org");
}
export async function removeAction(userId: string) {
  await api.removeUser(userId);
  revalidatePath("/org");
}
export async function rotateKeyAction() {
  await api.rotateKey();
}
