"use client";
import { useState } from "react";

export function AddProvider({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  const [name, setName] = useState("");
  return (
    <form action={action} className="flex gap-2 items-end">
      <input name="name" value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Provider name" aria-label="Provider name"
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <button type="submit" disabled={!name.trim()}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
        Add provider
      </button>
    </form>
  );
}
