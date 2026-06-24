"use client";
import { useActionState, useState } from "react";
import { use } from "react";
import { resetAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Brand } from "@/components/Brand";
import { PasswordRequirements } from "@/components/PasswordRequirements";
import { isPasswordValid } from "@/lib/password";

export default function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = use(searchParams);
  const [state, action, pending] = useActionState(resetAction, null);
  const [password, setPassword] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <Brand href={null} iconSize={30} textClass="text-xl" />
        <h1 className="mt-2 text-lg font-semibold text-slate-900">Set new password</h1>
        <p className="mt-1 text-sm text-slate-500">Choose a strong password</p>

        {state?.error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={action} className="mt-5 space-y-4">
          <input type="hidden" name="token" value={token ?? ""} />
          <FormField label="New password">
            <input
              name="password"
              type="password"
              placeholder="Min 8 characters"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <PasswordRequirements password={password} />
          </FormField>
          <Button type="submit" variant="primary" loading={pending} disabled={!isPasswordValid(password)} className="w-full">
            Set password
          </Button>
        </form>
      </div>
    </div>
  );
}
