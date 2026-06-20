"use client";
import { useActionState } from "react";
import { changePasswordAction } from "./actions";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
  const [state, action, pending] = useActionState(changePasswordAction, {});
  return (
    <section className="max-w-md space-y-6">
      <PageHeader title="Account settings" />
      <Card padding="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Change password</h2>
        <form action={action} className="space-y-3">
          <FormField label="Current password">
            <input name="currentPassword" type="password" required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </FormField>
          <FormField label="New password">
            <input name="newPassword" type="password" required minLength={8}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </FormField>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state.ok && <p className="text-sm text-emerald-600">Password updated. Other sessions were signed out.</p>}
          <Button type="submit" variant="primary" disabled={pending}>{pending ? "Saving…" : "Update password"}</Button>
        </form>
      </Card>
    </section>
  );
}
