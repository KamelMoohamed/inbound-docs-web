"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

export async function confirmAction(id: string, patientId: string | null, docType: string | null, acceptedUnchanged: boolean) {
  await api.confirm(id, { patient_id: patientId, doc_type: docType, accepted_unchanged: acceptedUnchanged });
  revalidatePath("/");
  redirect("/");
}
