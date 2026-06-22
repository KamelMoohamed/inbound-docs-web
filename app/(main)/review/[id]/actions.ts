"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

export async function confirmAction(id: string, patientId: string | null, docType: string | null, acceptedUnchanged: boolean) {
  await api.confirm(id, { patient_id: patientId, doc_type: docType, accepted_unchanged: acceptedUnchanged });
  revalidatePath("/");
  redirect("/inbox");
}

export async function confirmWithPatient(id: string, patientId: string, docType: string | null) {
  await api.confirm(id, { patient_id: patientId, doc_type: docType, accepted_unchanged: false });
  revalidatePath("/");
  redirect("/inbox");
}

export async function changeTypeAction(id: string, formData: FormData) {
  await api.updateDoc(id, { doc_type: String(formData.get("doc_type")) });
  revalidatePath(`/review/${id}`);
}

export async function assignAction(id: string, formData: FormData) {
  await api.assignDoc(id, {
    provider_id: String(formData.get("provider_id") || "") || null,
    user_id: String(formData.get("user_id") || "") || null,
  });
  revalidatePath(`/review/${id}`);
}

export async function discardAction(id: string, formData: FormData) {
  await api.discardDoc(id, String(formData.get("reason") || "discarded"));
  revalidatePath("/");
  redirect("/inbox");
}

export async function markDuplicateAction(id: string, formData: FormData) {
  await api.markDuplicate(id, String(formData.get("of_id") || ""));
  revalidatePath("/");
  redirect("/inbox");
}

export async function splitAction(id: string, formData: FormData) {
  const raw = String(formData.get("ranges") || "");
  const ranges = raw.split(",").map((s) => s.trim()).filter(Boolean);
  await api.splitDoc(id, ranges);
  revalidatePath("/");
  redirect("/inbox");
}
