import Link from "next/link";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function OrgAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; type?: string; actor?: string; page?: string }>;
}) {
  const session = await requireSession();
  if (!["owner", "admin"].includes(session.role)) {
    return <p className="text-slate-600">Only owners and admins can view the org audit log.</p>;
  }
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const { items } = await api.orgAudit({
    from: params.from,
    to: params.to,
    type: params.type,
    actor: params.actor,
    page,
  });

  const qs = (overrides: Record<string, string>) => {
    const p = new URLSearchParams();
    if (params.from) p.set("from", params.from);
    if (params.to) p.set("to", params.to);
    if (params.type) p.set("type", params.type);
    if (params.actor) p.set("actor", params.actor);
    Object.entries(overrides).forEach(([k, v]) => { if (v) p.set(k, v); else p.delete(k); });
    return p.toString();
  };

  return (
    <section>
      <PageHeader title="Org audit log" />
      <Card padding="p-4" className="mb-4">
        <form className="flex flex-wrap gap-2 items-end">
          <label className="text-sm">From<input name="from" type="date" defaultValue={params.from}
            className="mt-1 block rounded border border-slate-300 px-2 py-1 text-sm" /></label>
          <label className="text-sm">To<input name="to" type="date" defaultValue={params.to}
            className="mt-1 block rounded border border-slate-300 px-2 py-1 text-sm" /></label>
          <label className="text-sm">Type<input name="type" defaultValue={params.type}
            className="mt-1 block rounded border border-slate-300 px-2 py-1 text-sm" /></label>
          <label className="text-sm">Actor<input name="actor" defaultValue={params.actor}
            className="mt-1 block rounded border border-slate-300 px-2 py-1 text-sm" /></label>
          <button type="submit" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white">Filter</button>
        </form>
      </Card>
      <Card padding="p-0">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">No events found.</td></tr>
            )}
            {items.map((e) => (
              <tr key={e.id} className="border-b border-slate-100">
                <td className="px-4 py-3 text-slate-700">{e.event_type}</td>
                <td className="px-4 py-3 text-slate-500">{e.actor}</td>
                <td className="px-4 py-3 text-slate-400">{new Date(e.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="mt-4 flex gap-2">
        {page > 1 && <Link href={`/org/audit?${qs({ page: String(page - 1) })}`} className="text-sm text-indigo-600">← Prev</Link>}
        <Link href={`/org/audit?${qs({ page: String(page + 1) })}`} className="text-sm text-indigo-600">Next →</Link>
      </div>
    </section>
  );
}
