"use client";
import { useActionState } from "react";
import { portalAction } from "@/app/(main)/billing/actions";
import { withNetworkGuard } from "@/lib/formAction";
import { Button } from "@/components/ui/Button";

export function BillingPortalButton() {
  const [state, action, pending] = useActionState(withNetworkGuard(portalAction), null);

  return (
    <div>
      <form action={action}>
        <Button type="submit" variant="secondary" size="sm" disabled={pending}>
          {pending ? "Opening…" : "Manage subscription"}
        </Button>
      </form>
      {state?.error && (
        <p className="mt-2 text-sm text-red-600" role="alert">{state.error}</p>
      )}
    </div>
  );
}
