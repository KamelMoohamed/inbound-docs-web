"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

export async function markDocFiledAction(id: string) {
  await api.markBatchFiled([id]);
  revalidatePath("/review/[id]", "page");
  revalidatePath("/export");
  revalidatePath("/dashboard");
}

export async function confirmAction(id: string, patientId: string | null, docType: string | null, acceptedUnchanged: boolean) {
  await api.confirm(id, { patient_id: patientId, doc_type: docType, accepted_unchanged: acceptedUnchanged });
  // Stay on the report and re-render it in its filed state. Also refresh the
  // queue ("/") so the item drops off the inbox the next time it's viewed.
  revalidatePath("/");
  revalidatePath(`/review/${id}`);
}

export async function confirmWithPatient(id: string, patientId: string, docType: string | null) {
  await api.confirm(id, { patient_id: patientId, doc_type: docType, accepted_unchanged: false });
  revalidatePath("/");
  revalidatePath(`/review/${id}`);
}

export async function addPatientAndMatch(
  docId: string,
  patient: { first_name: string; last_name: string; dob: string | null; medicare_number: string | null },
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const created = await api.createPatient(patient);
    await api.updateDoc(docId, { patient_id: created.id });
    revalidatePath(`/review/${docId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to add patient" };
  }
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
