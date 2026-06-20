import Link from "next/link";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function HeldPage() {
  const docs = await api.listHeld();
  return (
    <section className="space-y-4">
      <PageHeader title="Held for credits" />
      {docs.length === 0 ? (
        <EmptyState>Nothing held — every document is being processed.</EmptyState>
      ) : (
        <Card padding="p-0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Received</th><th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3 text-right">Credit cost</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-500">{new Date(d.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700">{d.source}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{d.credit_cost ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <p className="text-sm text-slate-500">
        These documents are safely stored and will process automatically when you{" "}
        <Link href="/billing" className="font-medium text-indigo-600 underline">add credits</Link>.
      </p>
    </section>
  );
}
