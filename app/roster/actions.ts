"use server";
import { api } from "@/lib/api";

export type RosterState = { ok: boolean; message: string } | null;

export async function importRosterAction(_prev: RosterState, formData: FormData): Promise<RosterState> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false, message: "Please choose a CSV file first." };
  try {
    const res = await api.importRoster(formData);
    const n = Number(res?.imported ?? 0);
    return { ok: true, message: `Imported ${n} patient${n === 1 ? "" : "s"}.` };
  } catch (e) {
    return { ok: false, message: `Import failed: ${e instanceof Error ? e.message : String(e)}` };
  }
}
