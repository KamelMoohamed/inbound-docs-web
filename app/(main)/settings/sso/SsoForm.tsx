"use client";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { SsoConfig } from "@/lib/types";

export function SsoForm({
  config,
  save,
}: {
  config: SsoConfig;
  save: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={save} className="space-y-4">
      <p className="text-sm text-slate-600">OIDC issuer must support discovery (.well-known/openid-configuration).</p>
      <FormField label="Email domain">
        <input name="domain" defaultValue={config.domain ?? ""} required aria-label="Domain"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="acme.com" />
      </FormField>
      <FormField label="Issuer URL">
        <input name="issuer" defaultValue={config.issuer ?? ""} required aria-label="Issuer"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </FormField>
      <FormField label="Client ID">
        <input name="client_id" defaultValue={config.client_id ?? ""} required aria-label="Client ID"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </FormField>
      <FormField label="Client secret">
        <input name="client_secret" type="password" defaultValue="" aria-label="Client secret"
          placeholder="Leave blank to keep existing"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </FormField>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="enabled" defaultChecked={config.enabled ?? false} aria-label="Enable SSO" />
        Enable SSO for this organisation
      </label>
      <Button type="submit" variant="primary">Save</Button>
    </form>
  );
}
