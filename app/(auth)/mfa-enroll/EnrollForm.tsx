"use client";
import { useState } from "react";
import { completeEnroll } from "./actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

export function EnrollForm({ token }: { token: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      const r = await completeEnroll(token, code);
      if (r?.error) setError(r.error);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-2">
      <FormField label="Authenticator code">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          aria-label="6-digit authenticator code"
          placeholder="123456"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tracking-widest"
        />
      </FormField>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="button" variant="primary" className="w-full" disabled={pending} onClick={() => void submit()}>
        {pending ? "Enabling…" : "Enable MFA"}
      </Button>
    </div>
  );
}
