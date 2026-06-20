"use client";
import { useState } from "react";

export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <span className="flex items-stretch gap-2">
        <input readOnly value={value} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs" />
        <button type="button" onClick={copy}
          className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-50">
          {copied ? "Copied" : "Copy"}
        </button>
      </span>
    </label>
  );
}
