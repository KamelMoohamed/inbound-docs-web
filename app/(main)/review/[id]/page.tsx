import { api } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { PatientPicker } from "@/components/PatientPicker";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { confirmAction, changeTypeAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ReviewDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [doc, audit] = await Promise.all([api.getReview(id), api.getAudit(id)]);
  const confirm = confirmAction.bind(null, doc.id);

  const extracted = doc.extracted as Record<string, string> | null;

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <a
          href="/"
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
        >
          ← Back to queue
        </a>
        <Card className="mt-3 overflow-hidden" padding="p-0">
          <img
            src={`/api/raw/${doc.id}`}
            alt="original document"
            className="w-full"
          />
        </Card>
      </div>

      <Card padding="p-6" className="space-y-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-900">
            {doc.doc_type ?? "Unknown"}
          </h1>
          {doc.urgency === "urgent" && <Badge tone="danger">Urgent</Badge>}
        </div>

        {extracted && Object.keys(extracted).length > 0 && (
          <dl className="divide-y divide-slate-100">
            {Object.entries(extracted).map(([key, value]) => (
              <div key={key} className="flex flex-col py-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {key.replace(/_/g, " ")}
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {String(value)}
                </dd>
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

        <form
          action={async () => {
            "use server";
            await confirm(doc.matched_patient_id, doc.doc_type, true);
          }}
        >
          <Button
            type="submit"
            variant="primary"
            disabled={!doc.matched_patient_id}
            className="w-full"
          >
            Confirm &amp; file
          </Button>
        </form>

        <Card padding="p-4" className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">
            Reassign patient
          </p>
          <PatientPicker docId={doc.id} docType={doc.doc_type} />
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
