"use client";
import { useActionState, useState } from "react";
import { createChannelAction, type ChannelActionState } from "./actions";
import { CredentialsPanel } from "@/components/CredentialsPanel";
import { channelTypeLabel } from "@/lib/channels";
import Link from "next/link";

const TYPES = ["email", "efax", "sftp", "fhir", "hl7", "secure_msg"] as const;
const COST: Record<string, string> = {
  email: "1/page", efax: "5/page", sftp: "1/page",
  fhir: "1", hl7: "1", secure_msg: "1/page",
};
const FREE_TYPES = new Set(["email"]);

export function ChannelForm({ isPaid }: { isPaid: boolean }) {
  const [type, setType] = useState("email");
  const [state, action, pending] = useActionState<ChannelActionState, FormData>(createChannelAction, {});
  const locked = !isPaid && !FREE_TYPES.has(type);

  return (
    <div className="space-y-4">
      {!isPaid && (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
          <span className="text-amber-800">
            Free tier — email channels only.
          </span>
          <Link href="/billing" className="font-medium text-amber-900 underline hover:text-amber-700">
            Upgrade →
          </Link>
        </div>
      )}

      <form action={action} className="grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end">
        <label className="text-sm">Type
          <select name="type" value={type} onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {TYPES.map((t) => (
              <option key={t} value={t} disabled={!isPaid && !FREE_TYPES.has(t)}>
                {channelTypeLabel(t)}{!isPaid && !FREE_TYPES.has(t) ? " (paid plan)" : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm md:col-span-2">Label
          <input name="label" placeholder="Front desk fax"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>

        <button type="submit" disabled={pending || locked}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300">
          {pending ? "Creating…" : "Create channel"}
        </button>

        <p className="text-xs text-slate-500 md:col-span-4">
          Cost per document on this channel:{" "}
          <strong>{COST[type]}</strong> credit(s).
          {locked && (
            <span className="ml-2 text-amber-700">
              Upgrade your plan to enable this channel type.
            </span>
          )}
        </p>
      </form>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.setup && <CredentialsPanel setup={state.setup} />}
    </div>
  );
}
