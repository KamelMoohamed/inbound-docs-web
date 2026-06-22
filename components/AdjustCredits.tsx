"use client";
import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function AdjustCredits({
  adjust,
}: {
  adjust: (formData: FormData) => void | Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const valid = amount !== "" && Number(amount) !== 0 && reason.trim().length > 0;

  return (
    <form action={adjust} className="space-y-3 max-w-sm">
      <FormField label="Amount (positive or negative)">
        <input
          name="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-label="Amount"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </FormField>
      <FormField label="Reason">
        <input
          name="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-label="Reason"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </FormField>
      <Button type="submit" variant="primary" disabled={!valid}>Adjust credits</Button>
    </form>
  );
}
