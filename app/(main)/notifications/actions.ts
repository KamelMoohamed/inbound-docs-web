"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function markNotifReadAction(id: string) {
  await api.markNotifRead(id);
  revalidatePath("/", "layout");
}

export async function markAllReadAction() {
  await api.markAllRead();
  revalidatePath("/", "layout");
}
