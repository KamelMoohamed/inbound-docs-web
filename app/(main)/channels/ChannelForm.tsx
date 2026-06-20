"use client";
import { useState } from "react";
import { createChannelAction } from "./actions";

const TYPES = ["email", "efax", "sftp", "fhir", "hl7", "secure_msg"];
const COST: Record<string, string> = { email: "1", efax: "3–5/page", sftp: "1", fhir: "1", hl7: "1", secure_msg: "2" };

export function ChannelForm() {
  const [type, setType] = useState("email");
  return (
    <form action={createChannelAction} className="grid grid-cols-1 gap-3 md:grid-cols-5 md:items-end">
      <label className="text-sm">Type
        <select name="type" value={type} onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label className="text-sm md:col-span-2">Inbound address
        <input name="address" required placeholder="clinic@inbound.example.com"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <label className="text-sm">Label
        <input name="label" placeholder="Front desk fax"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Add channel</button>
      <input type="hidden" name="webhookSecret" value="" />
      <p className="text-xs text-slate-500 md:col-span-5">Cost per document on this channel: <strong>{COST[type]}</strong> credit(s).</p>
    </form>
  );
}
