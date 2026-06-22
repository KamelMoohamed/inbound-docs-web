import Link from "next/link";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminTenantsPage() {
  const tenants = await api.adminTenants();
  return (
    <section>
      <PageHeader title="Tenants" subtitle={`${tenants.length} organisations`} />
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-700">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-left text-slate-400">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Plan</th>
              <th className="px-4 py-2">Credits</th>
              <th className="px-4 py-2">Docs</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-t border-slate-700">
                <td className="px-4 py-2 font-medium">{t.name}</td>
                <td className="px-4 py-2">{t.plan ?? "—"}</td>
                <td className="px-4 py-2">{t.credit_balance.toLocaleString()}</td>
                <td className="px-4 py-2">{t.doc_count.toLocaleString()}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/tenants/${t.id}`} className="text-indigo-400 hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
