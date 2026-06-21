import { requireSession } from "../../../../lib/auth";
import { api, publicApi } from "../../../../lib/api";
import { ConnectForm } from "./ConnectForm";
import { connectApiKey, beginOAuth, disconnect, syncRoster } from "./actions";

export const dynamic = "force-dynamic";

export default async function IntegrationsSettingsPage() {
  const session = await requireSession();
  const [status, catalog, stuck] = await Promise.all([
    api.pmsConnection(),
    publicApi.pmsCatalog(),
    api.pmsStuck().catch(() => []),
  ]);
  const canManage = session.role === "owner" || session.role === "admin";

  const authKindFor = (key: string): "api_key" | "oauth2" =>
    (key === "halaxy" || key === "jane") ? "oauth2" : "api_key";
  const options = catalog.filter((c) => c.tier !== "export_only")
    .map((c) => ({ key: c.key, display_name: c.display_name, authKind: authKindFor(c.key) }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Connect your PMS</h1>

      {status.connected ? (
        <section className="rounded-lg border border-gray-200 p-4 flex flex-col gap-2">
          <p><span className="font-medium">{status.pmsType}</span> — {status.status}</p>
          <p className="text-sm text-gray-500">
            Last roster sync: {status.lastRosterSyncAt ? new Date(status.lastRosterSyncAt).toLocaleString() : "never"}
          </p>
          {status.lastError && <p className="text-sm text-red-600">{status.lastError}</p>}
          {canManage && (
            <div className="flex gap-2">
              <form action={syncRoster}><button className="border rounded px-3 py-1 text-sm">Sync roster now</button></form>
              <form action={disconnect}><button className="border rounded px-3 py-1 text-sm text-red-600">Disconnect</button></form>
            </div>
          )}
        </section>
      ) : (
        canManage
          ? <ConnectForm options={options} connectApiKey={connectApiKey} beginOAuth={beginOAuth} />
          : <p className="text-gray-600">No PMS connected. Ask an owner or admin to connect one.</p>
      )}

      <section>
        <h2 className="font-semibold mb-2">Write-back health</h2>
        {stuck.length === 0 ? (
          <p className="text-sm text-gray-500">All confirmed documents have been filed to the PMS.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead><tr className="text-left text-gray-500">
              <th className="py-1">Document</th><th>Status</th><th>Attempts</th><th>Error</th></tr></thead>
            <tbody>
              {stuck.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="py-1">{d.doc_type ?? d.id}</td>
                  <td>{d.write_back_status}</td>
                  <td>{d.write_back_attempts}</td>
                  <td className="text-red-600">{d.write_back_error ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
