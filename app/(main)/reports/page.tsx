import { api } from "@/lib/api";
import { Stat } from "@/components/Stat";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { formatRate, formatTurnaround } from "@/lib/reportFormat";

export const dynamic = "force-dynamic";

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const toDate = new Date();
  const defaultFrom = new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fromStr = params.from ?? defaultFrom.toISOString().slice(0, 10);
  const toStr = params.to ?? toDate.toISOString().slice(0, 10);
  const report = await api.reportSummary(fromStr, toStr);
  const maxFiled = Math.max(...(report.by_doc_type ?? []).map((r) => r.count), 1);

  return (
    <section className="space-y-8">
      <PageHeader title="Reports" />

      <Card padding="p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="flex gap-2">
            {PRESETS.map((p) => {
              const f = new Date(toDate.getTime() - p.days * 86_400_000).toISOString().slice(0, 10);
              const t = toDate.toISOString().slice(0, 10);
              const active = fromStr === f && toStr === t;
              return (
                <a key={p.days} href={`?from=${f}&to=${t}`}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                    active
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}>
                  {p.label}
                </a>
              );
            })}
          </div>
          <label className="text-xs text-slate-500">From
            <input type="date" name="from" defaultValue={fromStr}
              className="ml-2 rounded border border-slate-300 px-2 py-1 text-sm" />
          </label>
          <label className="text-xs text-slate-500">To
            <input type="date" name="to" defaultValue={toStr}
              className="ml-2 rounded border border-slate-300 px-2 py-1 text-sm" />
          </label>
          <button type="submit"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            Apply
          </button>
        </form>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Documents filed" value={report.total_filed ?? 0} accent="indigo" hint={`${fromStr} — ${toStr}`} />
        <Stat label="Median turnaround" value={formatTurnaround(report.median_turnaround_seconds)} accent="indigo" hint="ingest → confirmation" />
        <Stat label="Auto-file %" value={`${Math.round(report.auto_file_pct)}%`} accent="emerald" hint="accepted unchanged" />
        <Stat label="Urgent SLA adherence" value={`${Math.round(report.urgent_sla_adherence_pct)}%`} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-900">By document type</h2>
          <Card padding="p-0">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Count</th>
                  <th className="px-4 py-3 w-32">Share</th>
                </tr>
              </thead>
              <tbody>
                {(report.by_doc_type ?? []).length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">No data yet.</td></tr>
                )}
                {(report.by_doc_type ?? []).map((r) => (
                  <tr key={r.doc_type} className="border-b border-slate-100">
                    <td className="px-4 py-2.5 capitalize text-slate-700">{r.doc_type.replace(/_/g, " ")}</td>
                    <td className="px-4 py-2.5 text-slate-700">{r.count}</td>
                    <td className="px-4 py-2.5">
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-indigo-400"
                          style={{ width: `${Math.round((r.count / maxFiled) * 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Per-provider throughput</h2>
          <Card padding="p-0">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Filed</th>
                  <th className="px-4 py-3">Mis-file rate</th>
                </tr>
              </thead>
              <tbody>
                {report.per_provider.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">No data yet.</td></tr>
                )}
                {report.per_provider.map((p) => (
                  <tr key={p.provider_id} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-slate-700">{p.name}</td>
                    <td className="px-4 py-3 text-slate-700">{p.filed}</td>
                    <td className="px-4 py-3 text-slate-400">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </section>
  );
}
