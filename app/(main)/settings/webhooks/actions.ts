"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function createWebhookAction(url: string, events: string[]) {
  const result = await api.createWebhook({ url, events });
  revalidatePath("/settings/webhooks");
  return { secret: result.secret };
}

export async function deleteWebhookAction(id: string) {
  await api.deleteWebhook(id);
  revalidatePath("/settings/webhooks");
}

export async function testWebhookAction(id: string) {
  await api.testWebhook(id);
}

export async function toggleWebhookAction(id: string, active: boolean) {
  await api.updateWebhook(id, { active });
  revalidatePath("/settings/webhooks");
}
