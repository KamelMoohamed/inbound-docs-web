"use client";
import { useActionState } from "react";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xl font-semibold text-indigo-600">Inbound Docs</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back</p>

        {state?.error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

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
          <FormField label="Password">
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </FormField>
          <Button type="submit" variant="primary" loading={pending} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-500">
          No account?{" "}
          <a href="/signup" className="text-indigo-600 hover:underline">
            Create your organisation
          </a>
        </p>
        <p className="mt-2 text-sm text-slate-500">
          <a href="/forgot-password" className="text-indigo-600 hover:underline">
            Forgot password?
          </a>
        </p>
      </div>
    </div>
  );
}
