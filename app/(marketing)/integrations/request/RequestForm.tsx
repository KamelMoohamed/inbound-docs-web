"use client";
import { useState } from "react";

export function RequestForm({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  const [pmsName, setPmsName] = useState("");
  const [email, setEmail] = useState("");
  const ready = pmsName.trim().length > 0 && /.+@.+\..+/.test(email);

  return (
    <form action={action} className="flex flex-col gap-3 max-w-md">
      <label className="flex flex-col gap-1 text-sm">PMS name
        <input name="pms_name" aria-label="PMS name" value={pmsName} onChange={(e) => setPmsName(e.target.value)}
          className="border rounded px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Clinic name (optional)
        <input name="clinic_name" className="border rounded px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Your email
        <input name="contact_email" aria-label="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Anything else (optional)
        <textarea name="note" className="border rounded px-2 py-1" />
      </label>
      <button type="submit" disabled={!ready}
        className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-40">Request this PMS</button>
    </form>
  );
}
