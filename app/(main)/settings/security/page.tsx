import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { MfaEnrollWrapper } from "./MfaEnrollWrapper";

export const dynamic = "force-dynamic";

export default function SecuritySettingsPage() {
  return (
    <section className="max-w-md space-y-6">
      <PageHeader title="Security" />
      <Card padding="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Multi-factor authentication</h2>
        <MfaEnrollWrapper />
      </Card>
    </section>
  );
}
