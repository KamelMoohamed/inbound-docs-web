import { api } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { PatientPicker } from "@/components/PatientPicker";
import { AssignControl } from "@/components/AssignControl";
import { DispositionMenu } from "@/components/DispositionMenu";
import { SplitDialog } from "@/components/SplitDialog";
import { LoopClosure } from "@/components/LoopClosure";
import { AiUseNotice } from "@/components/AiUseNotice";
import { DeleteDocumentButton } from "@/components/DeleteDocumentButton";
import { AddPatientInline } from "@/components/AddPatientInline";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  confirmAction, changeTypeAction, assignAction,
  discardAction, markDuplicateAction, splitAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function ReviewDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [doc, audit, providers, pmsStatus] = await Promise.all([
    api.getReview(id),
    api.getAudit(id),
    api.listProviders(),
    api.pmsConnection().catch(() => ({ connected: false as const })),
  ]);
  const hasPms = pmsStatus.connected;
  const confirm = confirmAction.bind(null, doc.id);

  const extracted = doc.extracted as Record<string, string> | null;
  const filed = doc.status === "filed" || !!doc.pms_filing_id;

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <a href="/inbox" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
          ← Back to queue
        </a>
        <Card className="mt-3 overflow-hidden" padding="p-0">
          <img src={`/api/raw/${doc.id}`} alt="original document" className="w-full" />
        </Card>
        <Card padding="p-4" className="mt-3">
          <p className="mb-2 text-sm font-semibold text-slate-700">Split fax</p>
          <SplitDialog split={splitAction.bind(null, doc.id)} />
        </Card>
      </div>

      <Card padding="p-6" className="space-y-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-900">{doc.doc_type ?? "Unknown"}</h1>
          {doc.urgency === "urgent" && <Badge tone="danger">Urgent</Badge>}
        </div>

        {filed && (
          <LoopClosure
            pms_filing_id={doc.pms_filing_id}
            pms_task_id={doc.pms_task_id}
            pms_acknowledged_at={doc.pms_acknowledged_at}
          />
        )}

        <AiUseNotice />

        {extracted && Object.keys(extracted).length > 0 && (
          <dl className="divide-y divide-slate-100">
            {Object.entries(extracted).map(([key, value]) => (
              <div key={key} className="flex flex-col py-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{key.replace(/_/g, " ")}</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">{String(value)}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Matched patient:</span>
          <span className="text-sm font-medium text-slate-900">
            {doc.matched_patient
              ? `${doc.matched_patient.last_name}, ${doc.matched_patient.first_name}${doc.matched_patient.dob ? ` (${doc.matched_patient.dob})` : ""}`
              : "— none —"}
          </span>
          {doc.match_confidence != null && (
            <Badge tone={doc.match_confidence >= 80 ? "ok" : "warn"}>{doc.match_confidence.toFixed(0)}% conf</Badge>
          )}
        </div>

        <form action={changeTypeAction.bind(null, doc.id)} className="flex items-end gap-2">
          <label className="text-sm">Document type
            <select name="doc_type" defaultValue={doc.doc_type ?? "other"}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {["pathology", "radiology", "specialist_letter", "discharge_summary", "referral", "other"].map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="secondary">Save type</Button>
        </form>

        <Card padding="p-4" className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Assign to provider</p>
          <AssignControl providers={providers} assign={assignAction.bind(null, doc.id)} />
        </Card>

        <form action={async () => { "use server"; await confirm(doc.matched_patient_id, doc.doc_type, true); }}>
          <Button type="submit" variant="primary" disabled={!doc.matched_patient_id || !hasPms} className="w-full">
            Confirm &amp; file
          </Button>
        </form>
        {!hasPms && (
          <p className="text-xs text-slate-500 -mt-2">
            Connect a PMS in{" "}
            <a href="/settings/integrations" className="underline">
              Settings → Integrations
            </a>{" "}
            to file documents.
          </p>
        )}
        {!hasPms && (
          <DeleteDocumentButton discard={discardAction.bind(null, doc.id)} />
        )}

        <Card padding="p-4" className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Reassign patient</p>
          <PatientPicker docId={doc.id} docType={doc.doc_type} />
          {!doc.matched_patient_id && <AddPatientInline docId={doc.id} />}
        </Card>

        <Card padding="p-4" className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Disposition</p>
          <DispositionMenu
            discard={discardAction.bind(null, doc.id)}
            markDuplicate={markDuplicateAction.bind(null, doc.id)}
          />
        </Card>

        <Card padding="p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">Audit trail</p>
          <ol className="space-y-1 text-xs text-slate-600">
            {audit.length === 0 && <li className="text-slate-400">No events yet.</li>}
            {audit.map((e) => (
              <li key={e.id} className="flex justify-between gap-2">
                <span><span className="font-medium text-slate-800">{e.event_type}</span> · {e.actor}</span>
                <span className="text-slate-400">{new Date(e.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ol>
        </Card>
      </Card>
    </section>
  );
}
