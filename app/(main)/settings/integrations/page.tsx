import { requireSession } from "../../../../lib/auth";
import { api, publicApi } from "../../../../lib/api";
import { ConnectForm } from "./ConnectForm";
import { LoopClosure } from "@/components/LoopClosure";
import { FormButton } from "@/components/FormButton";
import { Badge } from "@/components/Badge";
import { TruncationBanner } from "@/components/TruncationBanner";
import { LocalTime } from "@/components/LocalTime";
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

  // Only Jane uses the OAuth authorize-redirect flow. Halaxy and Practice Better use
  // OAuth client-credentials, which we collect as an api_key-style "clientId:clientSecret".
  const authKindFor = (key: string): "api_key" | "oauth2" =>
    key === "jane" ? "oauth2" : "api_key";
  const options = catalog.filter((c) => c.tier !== "export_only")
    .map((c) => ({ key: c.key, display_name: c.display_name, authKind: authKindFor(c.key) }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Connect your PMS</h1>

      {status.connected ? (
        <section className="rounded-lg border border-gray-200 p-4 flex flex-col gap-2">
          <p><span className="font-medium">{status.pmsType}</span> — {status.status}</p>
          <p className="text-sm text-gray-500">
            Last roster sync: {status.lastRosterSyncAt ? <LocalTime value={status.lastRosterSyncAt} /> : "never"}
          </p>
          {status.lastError && <p className="text-sm text-red-600">{status.lastError}</p>}
          {canManage && (
            <div className="flex gap-2">
              <form action={syncRoster}><FormButton>Sync roster now</FormButton></form>
              <form action={disconnect}><FormButton variant="danger">Disconnect</FormButton></form>
            </div>
          )}
        </section>
      ) : (
        canManage
          ? <ConnectForm options={options} connectApiKey={connectApiKey} beginOAuth={beginOAuth} />
          : <p className="text-gray-600">No PMS connected. Ask an owner or admin to connect one.</p>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Write-back health</h2>
          {stuck.length > 0 && (
            <Badge tone="danger">{stuck.length} stuck</Badge>
          )}
        </div>

        {stuck.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-slate-600">All confirmed documents have been filed to the PMS.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-40" />
                <col className="w-24" />
                <col className="w-44" />
                <col className="w-16" />
                <col />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5">Document</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Loop closure</th>
                  <th className="px-4 py-2.5">Tries</th>
                  <th className="px-4 py-2.5">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stuck.map((d) => {
                  const statusTone =
                    d.write_back_status === "failed" ? "danger" :
                    d.write_back_status === "filing" ? "warn" : "warn";
                  const attemptsColor =
                    d.write_back_attempts >= 4 ? "text-red-600" :
                    d.write_back_attempts >= 2 ? "text-amber-600" : "text-slate-600";
                  return (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <a href={`/review/${d.id}`} className="font-medium text-indigo-600 hover:underline">
                          {d.doc_type ? d.doc_type.replace(/_/g, " ") : "Unknown"}
                        </a>
                        <p className="mt-0.5 text-xs text-slate-400">
                          <LocalTime value={d.updated_at} />
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone}>{d.write_back_status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <LoopClosure
                          pms_filing_id={d.pms_filing_id}
                          pms_task_id={d.pms_task_id}
                          pms_acknowledged_at={d.pms_acknowledged_at}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono text-xs ${attemptsColor}`}>
                          {d.write_back_attempts} / 5
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {d.write_back_error ? (
                          <span
                            title={d.write_back_error}
                            className="block truncate text-xs text-red-600"
                          >
                            {d.write_back_error}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {stuck.length >= 100 && <TruncationBanner limit={100} noun="stuck documents" />}
      </section>
    </div>
  );
}
