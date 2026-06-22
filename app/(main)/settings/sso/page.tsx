import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { SsoForm } from "./SsoForm";
import { saveSsoAction } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function SsoSettingsPage() {
  const session = await requireSession();
  if (!["owner", "admin"].includes(session.role)) {
    return <p className="text-slate-600">Only owners and admins can configure SSO.</p>;
  }
  const config = await api.getSso();
  return (
    <section className="max-w-lg">
      <PageHeader title="Single sign-on (OIDC)" />
      <Card padding="p-6">
        <SsoForm config={config} save={saveSsoAction} />
      </Card>
    </section>
  );
}
