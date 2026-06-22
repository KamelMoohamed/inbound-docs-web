"use server";
import { api } from "@/lib/api";

export async function exportDataAction() {
  const blob = await api.exportData();
  const buffer = Buffer.from(await blob.arrayBuffer());
  return { data: buffer.toString("base64"), filename: "clinidoc-export.zip" };
}
