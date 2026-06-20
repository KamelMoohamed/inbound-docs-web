"use client";
import { useState } from "react";
import type { Patient } from "@/lib/types";
import { updatePatientAction, deletePatientAction } from "./actions";

export function PatientRow({ p }: { p: Patient }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <tr className="border-b border-slate-100 bg-amber-50">
        <td colSpan={5} className="px-4 py-3">
          <form action={async (fd) => { await updatePatientAction(p.id, fd); setEditing(false); }}
            className="grid grid-cols-2 gap-2 md:grid-cols-5 md:items-end">
            <input name="first_name" defaultValue={p.first_name} className="rounded border border-slate-300 px-2 py-1 text-sm" />
            <input name="last_name" defaultValue={p.last_name} className="rounded border border-slate-300 px-2 py-1 text-sm" />
            <input name="dob" type="date" defaultValue={p.dob ?? ""} className="rounded border border-slate-300 px-2 py-1 text-sm" />
            <input name="medicare_number" defaultValue={p.medicare_number ?? ""} className="rounded border border-slate-300 px-2 py-1 text-sm" />
            <span className="flex gap-2">
              <button type="submit" className="rounded bg-indigo-600 px-3 py-1 text-xs text-white">Save</button>
              <button type="button" onClick={() => setEditing(false)} className="rounded border px-3 py-1 text-xs">Cancel</button>
            </span>
          </form>
        </td>
      </tr>
    );
  }
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-4 py-3 text-slate-700">{p.last_name}</td>
      <td className="px-4 py-3 text-slate-700">{p.first_name}</td>
      <td className="px-4 py-3 text-slate-700">{p.dob ?? "—"}</td>
      <td className="px-4 py-3 font-mono text-xs text-slate-700">{p.medicare_number ?? "—"}</td>
      <td className="flex gap-2 px-4 py-3">
        <button onClick={() => setEditing(true)} className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">Edit</button>
        <form action={deletePatientAction.bind(null, p.id)}>
          <button type="submit" className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50">Delete</button>
        </form>
      </td>
    </tr>
  );
}
