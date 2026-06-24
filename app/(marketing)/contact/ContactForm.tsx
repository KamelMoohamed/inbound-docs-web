"use client";
import { useActionState } from "react";
import { submitContact } from "./actions";
import { FIELD_LIMITS } from "@/lib/formLimits";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, null as null | { ok: boolean; error?: string });
  if (state?.ok) return <p className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-700">Thanks — we’ll be in touch shortly.</p>;
  return (
    <form action={action} className="space-y-4">
      <input name="name" placeholder="Your name" maxLength={FIELD_LIMITS.name} className="w-full rounded-md border border-slate-300 px-3 py-2" />
      <input name="email" type="email" placeholder="Work email" maxLength={FIELD_LIMITS.email} className="w-full rounded-md border border-slate-300 px-3 py-2" />
      <input name="practice" placeholder="Practice / organisation" maxLength={FIELD_LIMITS.practice} className="w-full rounded-md border border-slate-300 px-3 py-2" />
      <textarea name="message" placeholder="How can we help?" rows={4} maxLength={FIELD_LIMITS.message} className="w-full rounded-md border border-slate-300 px-3 py-2" />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
