"use server";
import { redirect } from "next/navigation";
import { publicApi } from "@/lib/api";
import { FIELD_LIMITS, anyTooLong } from "@/lib/formLimits";

export async function submitRequest(formData: FormData) {
  const pms_name = String(formData.get("pms_name") ?? "");
  const clinic_name = String(formData.get("clinic_name") ?? "");
  const contact_email = String(formData.get("contact_email") ?? "");
  const note = String(formData.get("note") ?? "");

  // Defence in depth: reject oversized fields even if the client maxLength is bypassed.
  if (
    anyTooLong(
      [pms_name, FIELD_LIMITS.pms_name],
      [clinic_name, FIELD_LIMITS.clinic_name],
      [contact_email, FIELD_LIMITS.email],
      [note, FIELD_LIMITS.note],
    )
  ) {
    redirect("/integrations/request?error=toolong");
  }

  await publicApi.submitPmsRequest({
    pms_name,
    clinic_name: clinic_name || undefined,
    contact_email,
    note: note || undefined,
  });
  redirect("/integrations/request?submitted=1");
}
