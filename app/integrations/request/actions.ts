"use server";
import { redirect } from "next/navigation";
import { publicApi } from "../../../lib/api";

export async function submitRequest(formData: FormData) {
  await publicApi.submitPmsRequest({
    pms_name: String(formData.get("pms_name") ?? ""),
    clinic_name: (formData.get("clinic_name") as string) || undefined,
    contact_email: String(formData.get("contact_email") ?? ""),
    note: (formData.get("note") as string) || undefined,
  });
  redirect("/integrations/request?submitted=1");
}
