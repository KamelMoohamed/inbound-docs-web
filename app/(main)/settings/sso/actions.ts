"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function saveSsoAction(formData: FormData) {
  const body: Record<string, unknown> = {
    domain: formData.get("domain") as string,
    issuer: formData.get("issuer") as string,
    client_id: formData.get("client_id") as string,
    enabled: formData.get("enabled") === "on",
  };
  const secret = formData.get("client_secret") as string;
  if (secret) body.client_secret = secret;
  await api.setSso(body);
  revalidatePath("/settings/sso");
}
