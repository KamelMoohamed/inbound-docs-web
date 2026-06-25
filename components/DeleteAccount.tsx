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
  const [step, setStep] = useState<"idle" | "confirm" | "type">("idle");
  const [typed, setTyped] = useState("");
  const match = typed === orgName;

  if (step === "idle") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-800">
          This permanently deletes your organisation, cancels billing, and removes all data. This cannot be undone.
        </p>
        <Button type="button" variant="danger" onClick={() => setStep("confirm")}>
          Delete organisation
        </Button>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="space-y-4 rounded-lg border border-red-300 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-900">
          Are you sure you want to permanently delete <span className="font-bold">{orgName}</span>?
        </p>
        <p className="text-xs text-red-700">
          All documents, patients, billing history, and settings will be erased. There is no recovery.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="danger" onClick={() => setStep("type")}>
            Yes, continue
          </Button>
          <Button type="button" variant="secondary" onClick={() => setStep("idle")}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-red-800">
        Type <span className="font-semibold">{orgName}</span> to confirm permanent deletion.
      </p>
      <FormField label={`Type "${orgName}" to confirm`}>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          aria-label={`Type ${orgName} to confirm`}
          className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm"
          autoFocus
        />
      </FormField>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="danger"
          disabled={!match}
          onClick={() => void onDelete(typed)}
        >
          Delete organisation
        </Button>
        <Button type="button" variant="secondary" onClick={() => setStep("idle")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
