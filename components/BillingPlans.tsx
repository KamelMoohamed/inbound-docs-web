"use client";
import { useActionState } from "react";
import { PlanCard } from "@/components/PlanCard";
import { checkoutAction } from "@/app/(main)/billing/actions";
import { withNetworkGuard } from "@/lib/formAction";

export function BillingPlans({
  plans,
  currentPlanKey,
}: {
  plans: Record<string, { monthlyCredits: number; rolloverCap: number }>;
  currentPlanKey: string | undefined;
}) {
  const [state, action, pending] = useActionState(withNetworkGuard(checkoutAction), null);

  return (
    <div className="space-y-3">
      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Object.entries(plans).map(([key, p]) => (
          <PlanCard
            key={key}
            planKey={key}
            monthlyCredits={p.monthlyCredits}
            current={currentPlanKey === key}
            action={action}
            pending={pending}
          />
        ))}
      </div>
    </div>
  );
}
