"use client";
import type { EscalationPolicy, OrgUser } from "@/lib/types";
import { FormButton } from "@/components/FormButton";

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-800">{label}</label>
      <p className="text-xs text-slate-500">{hint}</p>
      {children}
    </div>
  );
}

export function EscalationForm({
  policy, users, save,
}: {
  policy: EscalationPolicy;
  users: OrgUser[];
  save: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={save} className="flex flex-col gap-5 max-w-md">
      <Field
        label="Urgent SLA (minutes)"
        hint="How long an urgent document can sit in the review queue before it is escalated. Default 30 minutes."
      >
        <input name="urgent_sla_minutes" type="number" min={1} defaultValue={policy.urgent_sla_minutes}
          aria-label="Urgent SLA minutes"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </Field>

      <Field
        label="Routine SLA (minutes)"
        hint="How long a routine document can wait before escalation. Default 1 440 minutes (24 hours)."
      >
        <input name="routine_sla_minutes" type="number" min={1} defaultValue={policy.routine_sla_minutes}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </Field>

      <Field
        label="Failed document retry ceiling"
        hint="Maximum number of times the system retries a document that failed AI processing before giving up and alerting you."
      >
        <input name="failed_retry_ceiling" type="number" min={1} max={10} defaultValue={policy.failed_retry_ceiling}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </Field>

      <Field
        label="Escalate to"
        hint="The staff member who receives an in-app and email alert when a document breaches its SLA. Leave blank to alert all owners and admins."
      >
        <select name="escalate_to_user_id" defaultValue={policy.escalate_to_user_id ?? ""}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">— All owners & admins —</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name ?? u.email}</option>)}
        </select>
      </Field>

      <div className="pt-1">
        <FormButton variant="primary" size="md">Save policy</FormButton>
      </div>
    </form>
  );
}
