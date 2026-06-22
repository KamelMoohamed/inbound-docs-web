"use client";
import Link from "next/link";
import type { OnboardingStatus } from "@/lib/types";

const STEPS: { key: keyof OnboardingStatus; label: string; href: string; linkLabel: string }[] = [
  { key: "email_verified", label: "Verify your email", href: "/settings", linkLabel: "Settings" },
  { key: "has_channel", label: "Set up an inbound channel", href: "/channels", linkLabel: "Channels" },
  { key: "has_patients", label: "Import your patient roster", href: "/roster", linkLabel: "Roster" },
  { key: "pms_connected", label: "Connect your PMS", href: "/settings/integrations", linkLabel: "Integrations" },
  { key: "has_subscription", label: "Choose a subscription plan", href: "/billing", linkLabel: "Billing" },
];

export function OnboardingChecklist({
  status,
  dismiss,
}: {
  status: OnboardingStatus;
  dismiss: () => void;
}) {
  const done = STEPS.filter((s) => status[s.key]).length;
  const remaining = STEPS.length - done;

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-indigo-900">Getting started</h2>
          <p className="mt-1 text-sm text-indigo-800">
            {done} done · {remaining} remaining
          </p>
        </div>
        <button type="button" onClick={() => dismiss()} className="text-sm font-medium text-indigo-700 hover:underline">
          Dismiss
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {STEPS.map((step) => {
          const complete = !!status[step.key];
          return (
            <li key={step.key} className="flex items-center justify-between gap-2 text-sm">
              <span className={complete ? "text-emerald-800" : "text-slate-700"}>
                {complete ? "✓" : "▢"} {step.label}
              </span>
              {!complete && (
                <Link href={step.href} className="font-medium text-indigo-600 hover:underline">
                  {step.linkLabel}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
