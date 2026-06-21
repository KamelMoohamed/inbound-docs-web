"use client";
import { useActionState } from "react";
import { importRosterAction } from "@/app/(main)/roster/actions";

export function RosterImportForm() {
  const [state, action, pending] = useActionState(importRosterAction, null);
  return (
    <div className="max-w-md">
      <form action={action} className="space-y-3">
        <input
          type="file"
          name="file"
          accept=".csv"
          required
          disabled={pending}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-white hover:file:bg-slate-700"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Importing…" : "Import"}
        </button>
      </form>
      {state && (
        <p
          className={`mt-3 rounded border p-3 text-sm ${
            state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
