"use client";
import { useState } from "react";
import type { Provider } from "@/lib/types";
import { updateProviderAction, deleteProviderAction, toggleProviderAction } from "./actions";

export function ProviderRow({ p }: { p: Provider }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <tr className="border-b border-slate-100 bg-amber-50">
        <td colSpan={4} className="px-4 py-3">
          <form action={async (fd) => { await updateProviderAction(p.id, fd); setEditing(false); }}
            className="flex gap-2 items-end">
            <input name="name" defaultValue={p.name} className="rounded border border-slate-300 px-2 py-1 text-sm" />
            <button type="submit" className="rounded bg-indigo-600 px-3 py-1 text-xs text-white">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="rounded border px-3 py-1 text-xs">Cancel</button>
          </form>
        </td>
      </tr>
    );
  }
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-4 py-3 text-slate-700">{p.name}</td>
      <td className="px-4 py-3 text-slate-500">{p.external_id ?? "—"}</td>
      <td className="px-4 py-3">{p.active ? "Active" : "Inactive"}</td>
      <td className="flex gap-2 px-4 py-3">
        <button onClick={() => setEditing(true)} className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">Edit</button>
        <form action={toggleProviderAction.bind(null, p.id, !p.active)}>
          <button type="submit" className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
            {p.active ? "Deactivate" : "Activate"}
          </button>
        </form>
        <form action={deleteProviderAction.bind(null, p.id)}>
          <button type="submit" className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50">Delete</button>
        </form>
      </td>
    </tr>
  );
}
