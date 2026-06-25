"use client";
import { useState, useTransition } from "react";
import { Button } from "./ui/Button";

export function DeleteDocumentButton({
  discard,
}: {
  discard: (formData: FormData) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button type="button" variant="danger" className="w-full" onClick={() => setConfirming(true)}>
        Delete document
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 space-y-3">
      <p className="text-sm font-medium text-red-800">
        Permanently delete this document from the queue?
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="danger"
          size="sm"
          loading={pending}
          onClick={() =>
            startTransition(async () => {
              const fd = new FormData();
              fd.append("reason", "deleted without PMS");
              await discard(fd);
            })
          }
        >
          Yes, delete
        </Button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
