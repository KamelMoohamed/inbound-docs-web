"use client";
import { useState } from "react";
import { CopyField } from "@/components/CopyField";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const EVENTS = ["document.filed", "document.failed", "writeback.filed"];

export function WebhookForm({
  create,
}: {
  create: (url: string, events: string[]) => Promise<{ secret: string } | null>;
}) {
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [secret, setSecret] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const validUrl = /^https?:\/\/.+/.test(url);
  const canSubmit = validUrl && selected.length > 0 && !pending;

  const toggle = (ev: string) => {
    setSelected((prev) => (prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]));
  };

  const submit = async () => {
    setPending(true);
    try {
      const result = await create(url, selected);
      if (result?.secret) setSecret(result.secret);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <FormField label="Endpoint URL">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="URL"
          placeholder="https://hooks.example.com/inbound"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </FormField>
      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Events</legend>
        <div className="mt-2 space-y-1">
          {EVENTS.map((ev) => (
            <label key={ev} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(ev)}
                onChange={() => toggle(ev)}
                aria-label={ev}
              />
              {ev}
            </label>
          ))}
        </div>
      </fieldset>
      <Button type="button" variant="primary" disabled={!canSubmit} onClick={() => void submit()}>
        Create webhook
      </Button>
      {secret && <CopyField label="Signing secret (shown once)" value={secret} />}
    </div>
  );
}
