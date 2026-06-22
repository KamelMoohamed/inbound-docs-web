"use client";
import { useState } from "react";

export function MfaEnroll({
  setup,
  verify,
  disable,
  enabled,
  otpauthUrl,
  secret,
}: {
  setup: () => void | Promise<void>;
  verify: (formData: FormData) => void | Promise<void>;
  disable: (formData: FormData) => void | Promise<void>;
  enabled: boolean;
  otpauthUrl?: string;
  secret?: string;
}) {
  const [started, setStarted] = useState(!!otpauthUrl);
  const showEnroll = started || !!otpauthUrl;

  if (enabled) {
    return (
      <form action={disable} className="flex flex-col gap-2">
        <label className="text-sm">Enter code to disable MFA
          <input name="code" type="text" inputMode="numeric" autoComplete="one-time-code"
            pattern="[0-9]{6}" maxLength={6} required aria-label="6-digit MFA code"
            onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 6); }}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tracking-widest" />
        </label>
        <button type="submit" className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700">Disable MFA</button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {!showEnroll ? (
        <button type="button" onClick={async () => { await setup(); setStarted(true); }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
          Set up MFA
        </button>
      ) : (
        <form action={verify} className="flex flex-col gap-2">
          {otpauthUrl && (
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(otpauthUrl)}`}
              alt="MFA QR code" className="h-36 w-36" />
          )}
          {secret && <p className="font-mono text-xs text-slate-600">Secret: {secret}</p>}
          <label className="text-sm">Verification code
            <input name="code" type="text" inputMode="numeric" autoComplete="one-time-code"
              pattern="[0-9]{6}" maxLength={6} required aria-label="6-digit verification code"
              onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 6); }}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tracking-widest" />
          </label>
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Verify & enable</button>
        </form>
      )}
    </div>
  );
}
