"use client";
import { useState, useTransition } from "react";
import { Button } from "./ui/Button";
import { addPatientAndMatch } from "@/app/(main)/review/[id]/actions";
import { useRouter } from "next/navigation";

export function AddPatientInline({ docId }: { docId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="text-sm text-indigo-600 hover:underline">
        + Add new patient
      </button>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addPatientAndMatch(docId, {
        first_name: String(fd.get("first_name") ?? ""),
        last_name: String(fd.get("last_name") ?? ""),
        dob: (fd.get("dob") as string) || null,
        medicare_number: (fd.get("medicare_number") as string) || null,
      });
      if (result.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
      <p className="text-xs font-medium text-slate-700">New patient</p>
      <div className="grid grid-cols-2 gap-2">
        <input name="first_name" placeholder="First name" required
          className="rounded border border-slate-300 px-2 py-1 text-sm" />
        <input name="last_name" placeholder="Last name" required
          className="rounded border border-slate-300 px-2 py-1 text-sm" />
        <input name="dob" type="date" placeholder="DOB"
          className="rounded border border-slate-300 px-2 py-1 text-sm" />
        <input name="medicare_number" placeholder="Medicare #"
          className="rounded border border-slate-300 px-2 py-1 text-sm" />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" loading={pending}>Save & match</Button>
        <button type="button" onClick={() => setOpen(false)}
          className="text-sm text-slate-500 hover:underline">Cancel</button>
      </div>
    </form>
  );
}
