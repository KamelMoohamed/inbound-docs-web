import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { WebhookForm } from "./WebhookForm";
import { createWebhookAction, deleteWebhookAction, testWebhookAction, toggleWebhookAction } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function WebhooksSettingsPage() {
  const session = await requireSession();
  if (!["owner", "admin"].includes(session.role)) {
    return <p className="text-slate-600">Only owners and admins can manage webhooks.</p>;
  }
  const endpoints = await api.listWebhooks();

  return (
    <section className="max-w-2xl space-y-6">
      <PageHeader title="Webhooks" subtitle="Receive HTTP callbacks when events occur" />
      <Card padding="p-6">
        <h2 className="mb-4 text-base font-semibold">Create endpoint</h2>
        <WebhookForm create={createWebhookAction} />
      </Card>
      {endpoints.length > 0 && (
        <Card padding="p-6">
          <h2 className="mb-4 text-base font-semibold">Active endpoints</h2>
          <ul className="space-y-4">
            {endpoints.map((ep) => (
              <li key={ep.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm break-all">{ep.url}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {ep.events.map((ev) => (
                        <Badge key={ev} tone="muted">{ev}</Badge>
                      ))}
                    </div>
                  </div>
                  <Badge tone={ep.active ? "ok" : "muted"}>{ep.active ? "Active" : "Paused"}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={toggleWebhookAction.bind(null, ep.id, !ep.active)}>
                    <Button type="submit" variant="secondary" size="sm">
                      {ep.active ? "Pause" : "Enable"}
                    </Button>
                  </form>
                  <form action={testWebhookAction.bind(null, ep.id)}>
                    <Button type="submit" variant="secondary" size="sm">Send test</Button>
                  </form>
                  <form action={deleteWebhookAction.bind(null, ep.id)}>
                    <Button type="submit" variant="danger" size="sm">Delete</Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}
