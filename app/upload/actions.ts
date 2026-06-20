"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function uploadAction(formData: FormData) {
  await api.upload(formData);
  revalidatePath("/");
}
