"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function bulkConfirmAction(ids: string[]): Promise<{ succeeded: number; failed: number }> {
  const result = await api.bulkConfirm(ids);
  revalidatePath("/inbox");
  return result;
}
