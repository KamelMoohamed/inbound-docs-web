"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function saveEscalationAction(formData: FormData) {
  await api.setEscalationPolicy({
    urgent_sla_minutes: Number(formData.get("urgent_sla_minutes")),
    routine_sla_minutes: Number(formData.get("routine_sla_minutes")),
    failed_retry_ceiling: Number(formData.get("failed_retry_ceiling")),
    escalate_to_user_id: String(formData.get("escalate_to_user_id") || "") || null,
  });
  revalidatePath("/settings/escalation");
}
