"use client";
import type { EscalationPolicy } from "@/lib/types";
import type { OrgUser } from "@/lib/types";

export function EscalationForm({
  policy,
  users,
  save,
}: {
  policy: EscalationPolicy;
  users: OrgUser[];
  save: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={save} className="flex flex-col gap-3 max-w-md">
      <label className="text-sm">Urgent SLA (minutes)
        <input name="urgent_sla_minutes" type="number" defaultValue={policy.urgent_sla_minutes}
          aria-label="Urgent SLA minutes"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <label className="text-sm">Routine SLA (minutes)
        <input name="routine_sla_minutes" type="number" defaultValue={policy.routine_sla_minutes}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <label className="text-sm">Failed retry ceiling
        <input name="failed_retry_ceiling" type="number" defaultValue={policy.failed_retry_ceiling}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <label className="text-sm">Escalate to
        <select name="escalate_to_user_id" defaultValue={policy.escalate_to_user_id ?? ""}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">— none —</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </label>
      <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Save policy</button>
    </form>
  );
}
