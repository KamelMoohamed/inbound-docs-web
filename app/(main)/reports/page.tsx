import { api } from "@/lib/api";
import { Stat } from "@/components/Stat";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { formatRate, formatTurnaround } from "@/lib/reportFormat";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);
  const report = await api.reportSummary(fromStr, toStr);

  return (
    <section>
      <PageHeader title="Reports" subtitle={`${fromStr} — ${toStr}`} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Mis-file rate" value={formatRate(report.mis_file_rate)} accent="red" />
        <Stat label="Median turnaround" value={formatTurnaround(report.median_turnaround_seconds)} accent="indigo" />
        <Stat label="Auto-file %" value={`${report.auto_file_pct}%`} accent="emerald" />
        <Stat label="Urgent SLA adherence" value={`${report.urgent_sla_adherence_pct}%`} accent="emerald" />
      </div>
      <h2 className="mt-8 mb-3 text-base font-semibold text-slate-900">Per-provider throughput</h2>
      <Card padding="p-0">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Filed</th>
            </tr>
          </thead>
          <tbody>
            {report.per_provider.length === 0 && (
              <tr><td colSpan={2} className="px-4 py-6 text-center text-slate-500">No data yet.</td></tr>
            )}
            {report.per_provider.map((p) => (
              <tr key={p.provider_id} className="border-b border-slate-100">
                <td className="px-4 py-3 text-slate-700">{p.name}</td>
                <td className="px-4 py-3 text-slate-700">{p.filed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
