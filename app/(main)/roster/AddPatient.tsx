"use client";
import { useRef } from "react";
import { addPatientAction } from "./actions";

export function AddPatient() {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} action={async (fd) => { await addPatientAction(fd); ref.current?.reset(); }}
      className="grid grid-cols-2 gap-2 md:grid-cols-5 md:items-end">
      <input name="first_name" required placeholder="First name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input name="last_name" required placeholder="Last name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input name="dob" type="date" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input name="medicare_number" placeholder="Medicare" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Add patient</button>
    </form>
  );
}
