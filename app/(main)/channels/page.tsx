import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChannelForm } from "./ChannelForm";
import { RegenerateSecret } from "./RegenerateSecret";
import { DeleteChannel } from "./DeleteChannel";
import { toggleChannelAction } from "./actions";
import { channelTypeLabel } from "@/lib/channels";

const SECRET_TYPES = ["fhir", "hl7", "secure_msg", "sftp"];
const STALE_MS = 48 * 60 * 60 * 1000; // 48 hours

function lastReceivedLabel(iso: string | null | undefined, active: boolean): React.ReactNode {
  if (!iso) return <span className="text-slate-400 text-xs">Never</span>;
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  const label = h < 1 ? "< 1h ago" : h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
  const stale = active && diff > STALE_MS;
  return (
    <span className={`text-xs ${stale ? "font-medium text-amber-700" : "text-slate-500"}`}>
      {label}{stale && " ⚠"}
    </span>
  );
}

export const dynamic = "force-dynamic";

export default async function ChannelsPage() {
  const session = await requireSession();
  const [channels, billing] = await Promise.all([api.listChannels(), api.billingSummary()]);
  const canManage = ["owner", "admin"].includes(session.role);
  const isPaid = !!(billing.plan && billing.plan.status === "active");
  return (
    <section className="space-y-6">
      <PageHeader title="Incoming channels" />
      <Card padding="p-0">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Incoming address / number</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last received</th>
              {canManage && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {channels.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No channels yet.</td></tr>
            )}
            {channels.map((c) => (
              <tr key={c.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{channelTypeLabel(c.type)}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{c.address}</td>
                <td className="px-4 py-3 text-slate-600">{c.label ?? "—"}</td>
                <td className="px-4 py-3">
                  {c.active ? <Badge tone="ok">Active</Badge> : <Badge tone="muted">Paused</Badge>}
                </td>
                <td className="px-4 py-3">{lastReceivedLabel(c.last_received_at, c.active)}</td>
                {canManage && (
                  <td className="flex items-center gap-2 px-4 py-3">
                    <form action={toggleChannelAction.bind(null, c.id, !c.active)}>
                      <Button type="submit" variant="secondary" size="sm">
                        {c.active ? "Pause" : "Resume"}
                      </Button>
                    </form>
                    {SECRET_TYPES.includes(c.type) && <RegenerateSecret id={c.id} />}
                    <DeleteChannel id={c.id} type={c.type} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {canManage && (
        <Card padding="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Add an incoming channel</h2>
          <ChannelForm isPaid={isPaid} />
        </Card>
      )}
    </section>
  );
}
