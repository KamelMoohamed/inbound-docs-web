"use client";
import { useState } from "react";
import type { Patient } from "@/lib/types";
import { confirmWithPatient } from "@/app/review/[id]/actions";

export function PatientPicker({ docId, docType }: { docId: string; docType: string | null }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const search = async (value: string) => {
    setQ(value);
    if (value.length < 2) { setResults([]); return; }
    const r = await fetch(`/api/patients?q=${encodeURIComponent(value)}`);
    setResults(await r.json());
  };
  return (
    <div className="rounded border border-slate-200 bg-white p-3">
      <p className="mb-2 text-sm font-medium">Wrong patient? Search and re-assign:</p>
      <input value={q} onChange={(e) => search(e.target.value)} placeholder="Surname or first name"
             className="w-full rounded border border-slate-300 px-2 py-1 text-sm" />
      <ul className="mt-2 space-y-1">
        {results.map((p) => (
          <li key={p.id} className="flex items-center justify-between text-sm">
            <span>{p.last_name}, {p.first_name} {p.dob ? `(${p.dob})` : ""}</span>
            <form action={confirmWithPatient.bind(null, docId, p.id, docType)}>
              <button className="rounded bg-blue-600 px-2 py-1 text-xs text-white">Assign &amp; file</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
