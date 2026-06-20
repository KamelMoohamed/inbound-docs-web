"use client";
import { useActionState } from "react";
import { acceptAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

export function AcceptForm({
  token,
  email,
  role,
}: {
  token: string;
  email: string;
  role: string;
}) {
  const [state, action, pending] = useActionState(acceptAction, null);
  return (
    <>
      {state?.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="token" value={token} />
        <p className="text-sm text-slate-500">
          Invited as <strong>{role}</strong> ({email})
        </p>
        <FormField label="Your name">
          <input
            name="name"
            placeholder="Jane Smith"
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
        <Button type="submit" variant="primary" loading={pending} className="w-full">
          Join organisation
        </Button>
      </form>
    </>
  );
}
