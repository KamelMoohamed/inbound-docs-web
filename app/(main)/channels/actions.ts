"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import type { ChannelSetup } from "@/lib/types";

export type ChannelActionState = { setup?: ChannelSetup; error?: string };

export async function createChannelAction(_prev: ChannelActionState, formData: FormData): Promise<ChannelActionState> {
  try {
    const res = await api.createChannel({
      type: String(formData.get("type")),
      label: String(formData.get("label") || "") || undefined,
    });
    revalidatePath("/channels");
    return { setup: res.setup as ChannelSetup };
  } catch {
    return { error: "Could not create the channel." };
  }
}

export async function regenerateAction(_prev: ChannelActionState, formData: FormData): Promise<ChannelActionState> {
  try {
    const res = await api.regenerateChannelSecret(String(formData.get("id")));
    return { setup: res.setup as ChannelSetup };
  } catch {
    return { error: "Could not rotate the secret." };
  }
}

export async function toggleChannelAction(id: string, active: boolean) {
  await api.updateChannel(id, { active });
  revalidatePath("/channels");
}

export async function deleteChannelAction(id: string) {
  await api.deleteChannel(id);
  revalidatePath("/channels");
}
