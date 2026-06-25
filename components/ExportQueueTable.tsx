"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ExportRow } from "@/lib/types";
import { Badge } from "./Badge";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { markFiledAction } from "@/app/(main)/export/actions";

export function ExportQueueTable({ items }: { items: ExportRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ filed: number } | null>(null);
  const router = useRouter();

  if (items.length === 0)
    return <EmptyState message="No documents pending export — all confirmed documents have been filed." />;

  const allSelected = items.every((i) => selected.has(i.documentId));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(items.map((i) => i.documentId)));
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleMarkFiled = () => {
    startTransition(async () => {
      const r = await markFiledAction([...selected]);
      setResult(r);
      setSelected(new Set());
      router.refresh();
    });
  };

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5">
          <span className="text-sm font-medium text-emerald-800">{selected.size} selected</span>
          <Button type="button" variant="primary" size="sm" loading={pending} onClick={handleMarkFiled}>
            Mark filed in PMS
          </Button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-sm text-emerald-700 hover:underline"
          >
            Clear
          </button>
        </div>
      )}
      {result && (
        <p className="mb-3 text-sm text-emerald-700">
          Marked {result.filed} document{result.filed !== 1 ? "s" : ""} as filed.
        </p>
      )}
      <Card padding="p-0">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-slate-300"
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Medicare</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Urgency</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Doc date</th>
              <th className="px-4 py-3">File name</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr
                key={i.documentId}
                className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                  i.urgency === "urgent" ? "border-l-4 border-l-red-500" : ""
                } ${selected.has(i.documentId) ? "bg-emerald-50" : ""}`}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(i.documentId)}
                    onChange={() => toggle(i.documentId)}
                    className="rounded border-slate-300"
                    aria-label={`Select ${i.lastName}`}
                  />
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {i.lastName && i.firstName
                    ? `${i.lastName}, ${i.firstName}`
                    : <span className="text-slate-400">— unmatched —</span>}
                  {i.dob && (
                    <p className="mt-0.5 text-xs text-slate-400">{i.dob}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {i.medicareNumber ?? <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">
                    {i.docType ? i.docType.replace(/_/g, " ") : "—"}
                  </p>
                  {i.summary && (
                    <p className="mt-0.5 max-w-[160px] truncate text-xs text-slate-400" title={i.summary}>
                      {i.summary}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {i.urgency === "urgent"
                    ? <Badge tone="danger">Urgent</Badge>
                    : <Badge tone="muted">Routine</Badge>}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {i.provider ?? <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {i.documentDate ?? "—"}
                </td>
                <td className="px-4 py-3 max-w-[180px]">
                  <p className="truncate text-xs text-slate-500 font-mono" title={i.fileName}>
                    {i.fileName}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/review/${i.documentId}`}
                    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
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
