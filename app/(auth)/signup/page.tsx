"use client";
import { useActionState, useState } from "react";
import { signupAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signupAction, null);
  const [tos, setTos] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [dpa, setDpa] = useState(false);
  const canSubmit = tos && privacy && dpa;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xl font-semibold text-indigo-600">Inbound Docs</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">Create your organisation</h1>
        <p className="mt-1 text-sm text-slate-500">Get started in seconds</p>

        {state?.error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={action} className="mt-5 space-y-4">
          <FormField label="Organisation name">
            <input
              name="orgName"
              placeholder="Acme Clinic"
              required
              minLength={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </FormField>
          <FormField label="Your name">
            <input
              name="name"
              placeholder="Jane Smith"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </FormField>
          <FormField label="Email">
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </FormField>
          <FormField label="Password">
            <input
              name="password"
              type="password"
              placeholder="Min 8 characters"
              required
              minLength={8}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </FormField>
          <input type="hidden" name="tos_accepted" value={tos ? "true" : "false"} />
          <input type="hidden" name="privacy_accepted" value={privacy ? "true" : "false"} />
          <input type="hidden" name="dpa_accepted" value={dpa ? "true" : "false"} />
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={tos} onChange={(e) => setTos(e.target.checked)} aria-label="I agree to the Terms" className="mt-1" />
            <span>I agree to the <a href="/terms" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Terms</a></span>
          </label>
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} aria-label="I agree to the Privacy Policy" className="mt-1" />
            <span>I agree to the <a href="/privacy" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Privacy Policy</a></span>
          </label>
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={dpa} onChange={(e) => setDpa(e.target.checked)} aria-label="I agree to the Data Processing Agreement" className="mt-1" />
            <span>On behalf of my practice, I agree to the <a href="/dpa" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Data Processing Agreement</a> for handling patient health information</span>
          </label>
          <Button type="submit" variant="primary" loading={pending} disabled={!canSubmit} className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-500">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
