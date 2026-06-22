"use client";
import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function DeleteAccount({
  orgName,
  onDelete,
}: {
  orgName: string;
  onDelete: (confirm: string) => void | Promise<void>;
}) {
  const [confirm, setConfirm] = useState("");
  const match = confirm === orgName;
  return (
    <div className="space-y-4">
      <p className="text-sm text-red-800">
        This permanently deletes your organisation, cancels billing, and removes all data. This cannot be undone.
      </p>
      <FormField label={`Type "${orgName}" to confirm`}>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-label={`Type ${orgName} to confirm`}
          className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm"
        />
      </FormField>
      <Button
        type="button"
        variant="danger"
        disabled={!match}
        onClick={() => void onDelete(confirm)}
      >
        Delete organisation
      </Button>
    </div>
  );
}
