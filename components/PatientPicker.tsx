"use client";
import { useState } from "react";
import type { Patient } from "@/lib/types";
import { confirmWithPatient } from "@/app/(main)/review/[id]/actions";
import { Button } from "./ui/Button";

export function PatientPicker({
  docId,
  docType,
}: {
  docId: string;
  docType: string | null;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const search = async (value: string) => {
    setQ(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    const r = await fetch(`/api/patients?q=${encodeURIComponent(value)}`);
    setResults(await r.json());
  };
  return (
    <div className="space-y-2">
      <input
        value={q}
        onChange={(e) => search(e.target.value)}
        placeholder="Surname or first name"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
      <ul className="space-y-1">
        {results.map((p) => (
          <li key={p.id} className="flex items-center justify-between text-sm">
            <span className="text-slate-700">
              {p.last_name}, {p.first_name} {p.dob ? `(${p.dob})` : ""}
            </span>
            <form action={confirmWithPatient.bind(null, docId, p.id, docType)}>
              <Button type="submit" variant="secondary" size="sm">
                Assign &amp; file
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
