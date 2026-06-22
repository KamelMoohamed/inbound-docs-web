import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { DeleteAccount } from "@/components/DeleteAccount";
import { deleteOrgAction } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function DangerSettingsPage() {
  const session = await requireSession();
  if (session.role !== "owner") {
    return <p className="text-slate-600">Only the organisation owner can delete the account.</p>;
  }
  const profile = await api.me();
  const orgName = profile.orgName ?? "your organisation";
  return (
    <section className="max-w-lg">
      <PageHeader title="Danger zone" />
      <Card padding="p-6" className="border-red-200">
        <h2 className="mb-4 text-base font-semibold text-red-900">Delete organisation</h2>
        <DeleteAccount orgName={orgName} onDelete={deleteOrgAction} />
      </Card>
    </section>
  );
}
