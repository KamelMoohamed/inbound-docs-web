import { api } from "@/lib/api";
import { retryAction } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";

export default async function FailedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const { items: docs, total } = await api.listFailed(page);
  return (
    <section>
      <PageHeader title="Failed documents" />
      {total === 0 ? (
        <EmptyState message="No failed documents — everything is processing normally." />
      ) : (
        <Card padding="p-0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Error</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-700">{d.doc_type ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-red-600">{d.error ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <form action={retryAction.bind(null, d.id)}>
                      <Button type="submit" variant="secondary" size="sm">Retry</Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <Pagination page={page} total={total} buildHref={(p) => `?page=${p}`} />
    </section>
  );
}
