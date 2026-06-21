"use client";
import { useState } from "react";
import type { Provider } from "@/lib/types";

export function AssignControl({
  providers,
  assign,
}: {
  providers: Provider[];
  assign: (formData: FormData) => void | Promise<void>;
}) {
  const [providerId, setProviderId] = useState("");
  const selected = providers.find((p) => p.id === providerId);

  return (
    <form action={assign} className="flex flex-col gap-2">
      <label className="text-sm">Assign to provider
        <select name="provider_id" aria-label="Provider" value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">— select —</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>
      <input type="hidden" name="user_id" value={selected?.user_id ?? ""} />
      <button type="submit" disabled={!providerId}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40">
        Assign
      </button>
    </form>
  );
}
