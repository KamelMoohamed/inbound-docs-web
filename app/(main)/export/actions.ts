"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function markFiledAction(ids: string[]): Promise<{ filed: number }> {
  const result = await api.markBatchFiled(ids);
  revalidatePath("/export");
  revalidatePath("/dashboard");
  return result;
}

export async function markDocFiledAction(id: string): Promise<{ filed: number }> {
  const result = await api.markBatchFiled([id]);
  revalidatePath("/review/[id]", "page");
  revalidatePath("/export");
  revalidatePath("/dashboard");
  return result;
}
