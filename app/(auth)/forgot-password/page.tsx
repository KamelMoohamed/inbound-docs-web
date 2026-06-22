"use client";
import { useActionState } from "react";
import { forgotAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

export default function ForgotPage() {
  const [, action, pending] = useActionState(forgotAction, null);
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xl font-semibold text-indigo-600">CliniDoc</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">Reset your password</h1>
        <p className="mt-1 text-sm text-slate-500">We&apos;ll send you a reset link</p>

        <form action={action} className="mt-5 space-y-4">
          <FormField label="Email">
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </FormField>
          <Button type="submit" variant="primary" loading={pending} className="w-full">
            Send reset link
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-500">
          If your email is registered, you&apos;ll receive a link shortly.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          <a href="/login" className="text-indigo-600 hover:underline">
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  );
}
