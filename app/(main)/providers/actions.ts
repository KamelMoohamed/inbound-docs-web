"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function createProviderAction(formData: FormData) {
  await api.createProvider({
    name: String(formData.get("name") ?? ""),
    user_id: (formData.get("user_id") as string) || undefined,
  });
  revalidatePath("/providers");
}

export async function updateProviderAction(id: string, formData: FormData) {
  const body: Record<string, unknown> = {};
  const name = formData.get("name");
  const active = formData.get("active");
  if (name != null && String(name)) body.name = String(name);
  if (active != null) body.active = active === "true";
  await api.updateProvider(id, body);
  revalidatePath("/providers");
}

export async function toggleProviderAction(id: string, active: boolean) {
  await api.updateProvider(id, { active });
  revalidatePath("/providers");
}

export async function deleteProviderAction(id: string) {
  await api.deleteProvider(id);
  revalidatePath("/providers");
}
