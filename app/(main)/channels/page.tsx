import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChannelForm } from "./ChannelForm";
import { RegenerateSecret } from "./RegenerateSecret";
import { toggleChannelAction, deleteChannelAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ChannelsPage() {
  const session = await requireSession();
  const channels = await api.listChannels();
  const canManage = ["owner", "admin"].includes(session.role);
  return (
    <section className="space-y-6">
      <PageHeader title="Inbound channels" />
      <Card padding="p-0">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Type</th><th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Label</th><th className="px-4 py-3">Status</th>
              {canManage && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {channels.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No channels yet.</td></tr>
            )}
            {channels.map((c) => (
              <tr key={c.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{c.type}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{c.address}</td>
                <td className="px-4 py-3 text-slate-600">{c.label ?? "—"}</td>
                <td className="px-4 py-3">{c.active ? <Badge tone="ok">Active</Badge> : <Badge tone="muted">Paused</Badge>}</td>
                {canManage && (
                  <td className="flex gap-2 px-4 py-3">
                    <form action={toggleChannelAction.bind(null, c.id, !c.active)}>
                      <Button type="submit" variant="secondary" size="sm">{c.active ? "Pause" : "Resume"}</Button>
                    </form>
                    <form action={deleteChannelAction.bind(null, c.id)}>
                      <Button type="submit" variant="danger" size="sm">Delete</Button>
                    </form>
                    <RegenerateSecret id={c.id} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {canManage && (
        <Card padding="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Add an inbound channel</h2>
          <ChannelForm />
        </Card>
      )}
    </section>
  );
}
