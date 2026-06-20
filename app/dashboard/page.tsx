import { api } from "@/lib/api";
import { Stat } from "@/components/Stat";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const m = await api.metrics();
  return (
    <section>
      <h1 className="mb-4 text-xl font-semibold">Practice dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="In review" value={m.needs_review} />
        <Stat label="Urgent pending" value={m.urgent_pending} hint="surface these first" />
        <Stat label="Filed" value={m.filed_total} />
        <Stat label="Auto-handled" value={`${m.auto_handled_pct}%`} hint="accepted unchanged" />
      </div>
      <p className="mt-4 text-sm text-slate-500">
        Auto-handled % is your ROI headline — the share of documents the AI got right with zero correction.
      </p>
    </section>
  );
}
