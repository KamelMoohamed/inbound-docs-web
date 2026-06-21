import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { EscalationForm } from "./EscalationForm";
import { saveEscalationAction } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function EscalationSettingsPage() {
  const session = await requireSession();
  if (!["owner", "admin"].includes(session.role)) {
    return <p className="text-slate-600">Only owners and admins can edit escalation settings.</p>;
  }
  const [policy, users] = await Promise.all([api.escalationPolicy(), api.listOrgUsers()]);
  return (
    <section className="max-w-2xl">
      <PageHeader title="Escalation & SLA" />
      <Card padding="p-6">
        <EscalationForm policy={policy} users={users} save={saveEscalationAction} />
      </Card>
    </section>
  );
}
