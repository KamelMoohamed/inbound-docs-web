"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api } from "../../../../lib/api";

export async function connectApiKey(formData: FormData) {
  await api.pmsConnectApiKey(String(formData.get("pms_type") ?? ""), String(formData.get("api_key") ?? ""));
  revalidatePath("/settings/integrations");
}
export async function beginOAuth(pmsType: string) {
  const { url } = await api.pmsAuthorizeUrl(pmsType);
  redirect(url);
}
export async function disconnect() {
  await api.pmsDisconnect();
  revalidatePath("/settings/integrations");
}
export async function syncRoster() {
  await api.pmsSync();
  revalidatePath("/settings/integrations");
}
