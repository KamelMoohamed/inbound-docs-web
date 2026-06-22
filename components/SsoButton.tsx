"use client";
import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function SsoButton() {
  const [email, setEmail] = useState("");
  const go = () => {
    const domain = email.split("@")[1]?.trim();
    if (!domain) return;
    window.location.assign(`/auth/sso/authorize?domain=${encodeURIComponent(domain)}`);
  };
  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <FormField label="Work email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Work email"
          placeholder="you@company.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </FormField>
      <Button type="button" variant="secondary" className="mt-3 w-full" onClick={go}>
        Sign in with SSO
      </Button>
    </div>
  );
}
