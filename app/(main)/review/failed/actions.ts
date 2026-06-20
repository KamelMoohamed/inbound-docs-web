"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function retryAction(docId: string) {
  await api.retry(docId);
  revalidatePath("/review/failed");
}
