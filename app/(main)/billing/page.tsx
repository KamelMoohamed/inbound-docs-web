import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/Badge";
import { PlanCard } from "@/components/PlanCard";
import { creditTone } from "@/lib/format";
import { checkoutAction, portalAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await requireSession();
  const [summary, txns] = await Promise.all([api.billingSummary(), api.creditTxns()]);
  const canManage = ["owner", "admin"].includes(session.role);
  const tone = creditTone(summary.balance);

  return (
    <section className="space-y-6">
      <PageHeader title="Billing & credits" />

      {/* Balance + current plan */}
      <Card padding="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">Credit balance</div>
            <div className={`text-4xl font-bold ${tone === "danger" ? "text-red-600" : tone === "warn" ? "text-amber-600" : "text-slate-900"}`}>
              {summary.balance.toLocaleString()}
            </div>
            {summary.held > 0 && <div className="mt-1 text-sm text-amber-700">{summary.held} document(s) held, waiting for credits</div>}
          </div>
          <div className="text-right">
            {summary.plan ? (
              <>
                <Badge tone="ok">{summary.plan.key} · {summary.plan.status}</Badge>
                <div className="mt-1 text-xs text-slate-500">Renews {new Date(summary.plan.currentPeriodEnd).toLocaleDateString()}</div>
                {canManage && (
                  <form action={portalAction} className="mt-2">
                    <Button type="submit" variant="secondary" size="sm">Manage subscription</Button>
                  </form>
                )}
              </>
            ) : <Badge tone="muted">No active plan</Badge>}
          </div>
        </div>
      </Card>

      {/* Plan tiers */}
      {canManage && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Object.entries(summary.plans).map(([key, p]) => (
            <PlanCard key={key} planKey={key} monthlyCredits={p.monthlyCredits}
              current={summary.plan?.key === key} action={checkoutAction} />
          ))}
        </div>
      )}

      {/* Transaction history */}
      <Card padding="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Recent credit activity</h2>
        {txns.length === 0 ? (
          <p className="text-sm text-slate-500">No activity yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2">When</th><th className="py-2">Reason</th>
                <th className="py-2 text-right">Change</th><th className="py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="py-2 text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="py-2 text-slate-700">{t.reason}</td>
                  <td className={`py-2 text-right font-medium ${t.amount < 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {t.amount > 0 ? "+" : ""}{t.amount}
                  </td>
                  <td className="py-2 text-right text-slate-700">{t.balanceAfter.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </section>
  );
}
