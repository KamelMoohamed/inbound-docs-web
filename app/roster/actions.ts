"use server";
import { api } from "@/lib/api";

export async function importRosterAction(formData: FormData) {
  const res = await api.importRoster(formData);
  return res;
}
