import { api } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { PatientPicker } from "@/components/PatientPicker";
import { confirmAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ReviewDetail({ params }: { params: { id: string } }) {
  const doc = await api.getReview(params.id);
  const confirm = confirmAction.bind(null, doc.id);
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <a className="text-blue-600 underline" href="/">← Back to queue</a>
        <div className="mt-3 overflow-hidden rounded border border-slate-200 bg-white">
          {/* original document, streamed through the proxy */}
          <img src={`/api/raw/${doc.id}`} alt="original document" className="w-full" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{doc.doc_type ?? "Unknown"}</h1>
          {doc.urgency === "urgent" && <Badge tone="danger">Urgent</Badge>}
        </div>
        <pre className="overflow-auto rounded bg-slate-100 p-3 text-xs">{JSON.stringify(doc.extracted, null, 2)}</pre>
        <p className="text-sm text-slate-600">
          Matched patient: <span className="font-mono">{doc.matched_patient_id ?? "—"}</span>
          {doc.match_confidence != null && <> (conf {doc.match_confidence.toFixed(0)})</>}
        </p>
        {/* one-click confirm */}
        <form action={async () => { "use server"; await confirm(doc.matched_patient_id, doc.doc_type, true); }}>
          <button className="rounded bg-emerald-600 px-4 py-2 text-white" disabled={!doc.matched_patient_id}>
            Confirm &amp; file
          </button>
        </form>
        {/* correct the patient, then confirm */}
        <PatientPicker docId={doc.id} docType={doc.doc_type} />
      </div>
    </section>
  );
}
