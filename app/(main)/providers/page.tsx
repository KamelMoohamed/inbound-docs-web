import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { AddProvider } from "./AddProvider";
import { ProviderRow } from "./ProviderRow";
import { createProviderAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  const providers = await api.listProviders();
  return (
    <section className="max-w-4xl">
      <PageHeader title="Provider directory" />
      <Card padding="p-6" className="mb-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Add a provider</h2>
        <AddProvider action={createProviderAction} />
      </Card>
      <Card padding="p-0">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">External ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {providers.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No providers yet.</td></tr>
            )}
            {providers.map((p) => <ProviderRow key={p.id} p={p} />)}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
