"use client";

export function MfaChallenge({
  mfaToken,
  submit,
}: {
  mfaToken: string;
  submit: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={submit} className="mt-4 space-y-3">
      <input type="hidden" name="mfaToken" value={mfaToken} />
      <label className="text-sm">Authentication code
        <input name="code" type="text" inputMode="numeric" autoComplete="one-time-code"
          pattern="[0-9]{6}" maxLength={6} required aria-label="6-digit MFA code"
          onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 6); }}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tracking-widest" />
      </label>
      <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
        Verify
      </button>
    </form>
  );
}
