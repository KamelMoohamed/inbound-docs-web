"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export type ActionState = { ok: boolean; message: string } | null;

export async function uploadAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false, message: "Please choose a file first." };
  try {
    const result = await api.upload(formData);
    revalidatePath("/");
    if (result?.is_duplicate) {
      return { ok: false, message: `"${file.name}" has already been uploaded. You can find it in the review queue.` };
    }
    return { ok: true, message: `Uploaded "${file.name}". It will appear in the review queue once the worker processes it.` };
  } catch (e) {
    return { ok: false, message: `Upload failed: ${e instanceof Error ? e.message : String(e)}` };
  }
}
