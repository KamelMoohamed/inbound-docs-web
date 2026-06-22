import { api } from "@/lib/api";
import { AdjustCredits } from "@/components/AdjustCredits";
import { adjustCreditsAction, impersonateAction } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function AdminTenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await api.adminTenant(id);
  const adjust = adjustCreditsAction.bind(null, id);
  const impersonate = impersonateAction.bind(null, id);

  return (
    <section className="space-y-6">
      <PageHeader title={tenant.name} subtitle={tenant.id} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card padding="p-4" className="bg-slate-800 border-slate-700">
          <p className="text-xs uppercase text-slate-400">Plan</p>
          <p className="text-lg font-semibold">{tenant.plan ?? "None"}</p>
        </Card>
        <Card padding="p-4" className="bg-slate-800 border-slate-700">
          <p className="text-xs uppercase text-slate-400">Credits</p>
          <p className="text-lg font-semibold">{tenant.credit_balance.toLocaleString()}</p>
        </Card>
        <Card padding="p-4" className="bg-slate-800 border-slate-700">
          <p className="text-xs uppercase text-slate-400">Documents</p>
          <p className="text-lg font-semibold">{tenant.doc_count.toLocaleString()}</p>
        </Card>
      </div>
      <Card padding="p-6" className="bg-slate-800 border-slate-700">
        <h2 className="mb-4 text-base font-semibold">Adjust credits</h2>
        <AdjustCredits adjust={adjust} />
      </Card>
      <form action={impersonate}>
        <Button type="submit" variant="secondary">Impersonate tenant</Button>
      </form>
    </section>
  );
}
