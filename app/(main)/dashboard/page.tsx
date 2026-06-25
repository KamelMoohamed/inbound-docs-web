import { api } from "@/lib/api";
import { Stat } from "@/components/Stat";
import { OverdueBanner } from "@/components/OverdueBanner";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { dismissOnboardingAction } from "@/app/(main)/onboarding/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { LocalTime } from "@/components/LocalTime";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [m, billing, onboarding, exportQueue] = await Promise.all([
    api.metrics(),
    api.billingSummary(),
    api.onboarding().catch(() => null),
    api.exportPending().catch(() => ({ items: [], total: 0 })),
  ]);
  const showOnboarding = onboarding && !onboarding.complete && !onboarding.dismissed;
  return (
    <section>
      <PageHeader
        title="Practice dashboard"
        subtitle={
          <LocalTime
            locale="en-AU"
            options={{ weekday: "long", year: "numeric", month: "long", day: "numeric" }}
          />
        }
      />
      {showOnboarding && (
        <div className="mb-6">
          <OnboardingChecklist status={onboarding} dismiss={dismissOnboardingAction} />
        </div>
      )}
      <OverdueBanner metrics={m} />
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="In review" value={m.needs_review} accent="indigo" href="/inbox" hint="click to open queue" />
        <Stat label="Urgent pending" value={m.urgent_pending} hint="surface these first" accent="red" href="/inbox?urgency=urgent" />
        <Stat label="Filed (all time)" value={m.filed_total} accent="emerald" />
        <Stat label="Auto-handled (all time)" value={`${m.auto_handled_pct}%`} hint="accepted unchanged" accent="emerald" />
      </div>
      {exportQueue.total > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat
            label="Pending export"
            value={exportQueue.total}
            accent="amber"
            href="/export"
            hint="ready to download and file"
          />
        </div>
      )}
      {m.urgent_pending > 0 && (
        <Card className="mt-4 border-red-200 bg-red-50 text-sm text-red-800">
          <strong>Overdue urgent:</strong> {m.urgent_pending} document(s) need immediate attention.
        </Card>
      )}
      {m.filed_total > 0 && (
        <Card className="mt-6 border-indigo-200 bg-indigo-50 text-sm text-indigo-800">
          <span className="font-semibold">{m.auto_handled_pct}%</span> of your{" "}
          {m.filed_total.toLocaleString()} filed document{m.filed_total === 1 ? "" : "s"} were
          accepted without any correction — that&apos;s your AI automation rate.
          {m.auto_handled_pct >= 80 && " Strong result."}
          {m.auto_handled_pct > 0 && m.auto_handled_pct < 50 && " As your patient roster grows, match accuracy improves."}
        </Card>
      )}
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
