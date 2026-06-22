"use client";
import { useActionState } from "react";
import { resendVerificationAction } from "@/app/(main)/actions/verify";

export function VerifyBannerInner({ emailVerified }: { emailVerified: boolean }) {
  const [state, action, pending] = useActionState(resendVerificationAction, null);
  if (emailVerified) return null;
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-sm text-amber-900">
      Verify your email to unlock your trial.{" "}
      <form action={action} className="inline">
        <button type="submit" disabled={pending} className="font-semibold underline disabled:opacity-50">
          {pending ? "Sending…" : "Resend"}
        </button>
      </form>
      {state?.ok && <span className="ml-2 text-emerald-700">Check your inbox.</span>}
      {state?.error && <span className="ml-2 text-red-700">{state.error}</span>}
    </div>
  );
}
