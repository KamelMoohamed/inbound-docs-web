"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import type { ReviewItem } from "@/lib/types";
import { Badge } from "./Badge";
import { Button } from "./ui/Button";
import { confidenceLevel, bandLabel } from "@/lib/format";
import { Card } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { bulkConfirmAction } from "@/app/(main)/inbox/actions";
import { useRouter } from "next/navigation";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function ReviewTable({ items, queryContext = "" }: { items: ReviewItem[]; queryContext?: string }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ succeeded: number; failed: number } | null>(null);
  const router = useRouter();

  if (items.length === 0)
    return <EmptyState message="Nothing to review right now — you're all caught up." />;

  const allSelected = items.every((i) => selected.has(i.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)));
  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const bulkConfirm = () => {
    startTransition(async () => {
      const r = await bulkConfirmAction([...selected]);
      setResult(r);
      setSelected(new Set());
      router.refresh();
    });
  };

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5">
          <span className="text-sm font-medium text-indigo-800">{selected.size} selected</span>
          <Button type="button" variant="primary" size="sm" loading={pending} onClick={bulkConfirm}>
            Confirm all selected
          </Button>
          <button type="button" onClick={() => setSelected(new Set())}
            className="text-sm text-indigo-600 hover:underline">Clear</button>
        </div>
      )}
      {result && (
        <p className="mb-3 text-sm text-emerald-700">
          Confirmed {result.succeeded} document{result.succeeded !== 1 ? "s" : ""}.
          {result.failed > 0 && ` ${result.failed} could not be confirmed (no patient matched).`}
        </p>
      )}
      <Card padding="p-0">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-3 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="rounded border-slate-300" aria-label="Select all" />
              </th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Urgency</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr
                key={i.id}
                className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                  i.urgency === "urgent" ? "border-l-4 border-l-red-500" : ""
                } ${selected.has(i.id) ? "bg-indigo-50" : ""}`}
              >
                <td className="px-3 py-3">
                  <input type="checkbox" checked={selected.has(i.id)} onChange={() => toggle(i.id)}
                    className="rounded border-slate-300" aria-label={`Select ${i.doc_type ?? i.id}`} />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{i.doc_type ? i.doc_type.replace(/_/g, " ") : "—"}</p>
                  {i.summary && <p className="mt-0.5 text-xs text-slate-400 truncate max-w-[180px]" title={i.summary}>{i.summary}</p>}
                </td>
                <td className="px-4 py-3">
                  {i.urgency === "urgent"
                    ? <Badge tone="danger">Urgent</Badge>
                    : <Badge tone="muted">Routine</Badge>}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {i.matched_patient
                    ? `${i.matched_patient.last_name}, ${i.matched_patient.first_name}`
                    : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  {i.match_confidence == null ? "—" : (
                    <Badge tone={confidenceLevel(i.match_confidence) === "high" ? "ok" : "warn"}>
                      {i.match_confidence.toFixed(0)}%
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 capitalize">{i.source ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                  {i.created_at ? timeAgo(i.created_at) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/review/${i.id}${queryContext ? `?${queryContext}` : ""}`}
                    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
