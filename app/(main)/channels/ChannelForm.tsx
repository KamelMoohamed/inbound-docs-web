"use client";
import { useActionState, useState } from "react";
import { createChannelAction, type ChannelActionState } from "./actions";
import { CredentialsPanel } from "@/components/CredentialsPanel";
import { channelTypeLabel } from "@/lib/channels";

const TYPES = ["email", "efax", "sftp", "fhir", "hl7", "secure_msg"];
const COST: Record<string, string> = { email: "1", efax: "3–5/page", sftp: "1", fhir: "1", hl7: "1", secure_msg: "2" };

export function ChannelForm() {
  const [type, setType] = useState("email");
  const [state, action, pending] = useActionState<ChannelActionState, FormData>(createChannelAction, {});
  return (
    <div className="space-y-4">
      <form action={action} className="grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end">
        <label className="text-sm">Type
          <select name="type" value={type} onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {TYPES.map((t) => <option key={t} value={t}>{channelTypeLabel(t)}</option>)}
          </select>
        </label>
        <label className="text-sm md:col-span-2">Label
          <input name="label" placeholder="Front desk fax"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <button type="submit" disabled={pending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-300">
          {pending ? "Creating…" : "Create channel"}
        </button>
        <p className="text-xs text-slate-500 md:col-span-4">
          We generate the incoming address &amp; secret for you. Cost per document on this channel: <strong>{COST[type]}</strong> credit(s).
        </p>
      </form>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.setup && <CredentialsPanel setup={state.setup} />}
    </div>
  );
}
