"use client";
import { useState } from "react";

export function SplitDialog({ split }: { split: (formData: FormData) => void | Promise<void> }) {
  const [ranges, setRanges] = useState("");
  return (
    <form action={split} className="flex flex-col gap-2">
      <label className="text-sm">Page ranges (comma-separated)
        <input name="ranges" value={ranges} onChange={(e) => setRanges(e.target.value)}
          placeholder="1-2, 3" aria-label="Page ranges"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <button type="submit" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
        Split document
      </button>
    </form>
  );
}

export function parseRanges(raw: string): string[] {
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}
