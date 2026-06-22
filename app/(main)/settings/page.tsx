"use client";
import { useActionState } from "react";
import { changePasswordAction, updateNameAction } from "./actions";
import { ExportDataButton } from "./ExportDataButton";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import Link from "next/link";

export default function SettingsPage() {
  const [state, action, pending] = useActionState(changePasswordAction, {});
  const [nameState, nameAction, namePending] = useActionState(updateNameAction, {});
  return (
    <section className="max-w-md space-y-6">
      <PageHeader title="Account settings" />
      <nav className="flex flex-wrap gap-3 text-sm">
        <Link href="/settings/sso" className="text-indigo-600 hover:underline">SSO</Link>
        <Link href="/settings/webhooks" className="text-indigo-600 hover:underline">Webhooks</Link>
        <Link href="/settings/danger" className="text-red-600 hover:underline">Danger zone</Link>
      </nav>
      <Card padding="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Export data</h2>
        <p className="mb-3 text-sm text-slate-600">Download a zip archive of your organisation&apos;s data.</p>
        <ExportDataButton />
      </Card>
      <Card padding="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Display name</h2>
        <form action={nameAction} className="space-y-3">
          <FormField label="Name">
            <input name="name" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </FormField>
          {nameState.error && <p className="text-sm text-red-600">{nameState.error}</p>}
          {nameState.ok && <p className="text-sm text-emerald-600">Name updated.</p>}
          <Button type="submit" variant="primary" disabled={namePending}>{namePending ? "Saving…" : "Save name"}</Button>
        </form>
      </Card>
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
