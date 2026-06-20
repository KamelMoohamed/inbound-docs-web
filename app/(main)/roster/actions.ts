"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export type RosterState = { ok: boolean; message: string } | null;

export async function importRosterAction(_prev: RosterState, formData: FormData): Promise<RosterState> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false, message: "Please choose a CSV file first." };
  try {
    const res = await api.importRoster(formData);
    const n = Number(res?.imported ?? 0);
    revalidatePath("/roster");
    return { ok: true, message: `Imported ${n} patient${n === 1 ? "" : "s"}.` };
  } catch (e) {
    return { ok: false, message: `Import failed: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function rematchAction() {
  await api.rematch();
  revalidatePath("/roster");
}

export async function addPatientAction(formData: FormData) {
  await api.createPatient({
    first_name: String(formData.get("first_name")),
    last_name: String(formData.get("last_name")),
    dob: String(formData.get("dob") || "") || null,
    medicare_number: String(formData.get("medicare_number") || "") || null,
  });
  revalidatePath("/roster");
}

export async function updatePatientAction(id: string, formData: FormData) {
  await api.updatePatient(id, {
    first_name: String(formData.get("first_name")),
    last_name: String(formData.get("last_name")),
    dob: String(formData.get("dob") || "") || null,
    medicare_number: String(formData.get("medicare_number") || "") || null,
  });
  revalidatePath("/roster");
}

export async function deletePatientAction(id: string) {
  await api.deletePatient(id);
  revalidatePath("/roster");
}
