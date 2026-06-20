"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function createChannelAction(formData: FormData) {
  await api.createChannel({
    type: String(formData.get("type")),
    address: String(formData.get("address")),
    label: String(formData.get("label") || "") || undefined,
    webhookSecret: String(formData.get("webhookSecret") || "") || undefined,
  });
  revalidatePath("/channels");
}

export async function toggleChannelAction(id: string, active: boolean) {
  await api.updateChannel(id, { active });
  revalidatePath("/channels");
}

export async function deleteChannelAction(id: string) {
  await api.deleteChannel(id);
  revalidatePath("/channels");
}
