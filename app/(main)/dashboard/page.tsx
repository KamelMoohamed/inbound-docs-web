import { api } from "@/lib/api";
import { Stat } from "@/components/Stat";
import { OverdueBanner } from "@/components/OverdueBanner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [m, billing] = await Promise.all([api.metrics(), api.billingSummary()]);
  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  return (
    <section>
      <PageHeader title="Practice dashboard" subtitle={today} />
      <OverdueBanner metrics={m} />
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="In review" value={m.needs_review} accent="indigo" />
        <Stat label="Urgent pending" value={m.urgent_pending} hint="surface these first" accent="red" />
        <Stat label="Filed" value={m.filed_total} accent="emerald" />
        <Stat label="Auto-handled" value={`${m.auto_handled_pct}%`} hint="accepted unchanged" accent="emerald" />
      </div>
      {m.urgent_pending > 0 && (
        <Card className="mt-4 border-red-200 bg-red-50 text-sm text-red-800">
          <strong>Overdue urgent:</strong> {m.urgent_pending} document(s) need immediate attention.
        </Card>
      )}
      <Card className="mt-6 border-indigo-200 bg-indigo-50 text-sm text-indigo-800">
        Auto-handled % is your ROI headline — the share of documents the AI got right with zero correction.
      </Card>
      <h2 className="mt-8 mb-4 text-lg font-semibold">Credits</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Balance" value={billing.balance.toLocaleString()} hint={billing.plan ? `${billing.plan.key} plan` : "no plan"} />
        <Stat label="Held for credits" value={billing.held} hint="auto-process on top-up" />
        <Stat label="Monthly allotment" value={billing.plan ? billing.plan.monthlyCredits.toLocaleString() : "—"} />
        <Stat label="Rollover cap" value={billing.plan ? billing.plan.rolloverCap.toLocaleString() : "—"} />
      </div>
    </section>
  );
}
