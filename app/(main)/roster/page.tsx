import { api } from "@/lib/api";
import { RosterImportForm } from "@/components/RosterImportForm";
import { rematchAction } from "./actions";
import { AddPatient } from "./AddPatient";
import { PatientRow } from "./PatientRow";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  const patients = await api.searchPatients("");
  return (
    <section className="max-w-4xl">
      <PageHeader title="Patient roster" />

      <Card padding="p-6" className="mb-6 space-y-4">
        <p className="text-sm text-slate-500">
          Import a CSV with columns:{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            external_id,first_name,last_name,dob,medicare_number
          </code>
        </p>
        <RosterImportForm />
        <form action={rematchAction} className="flex flex-col gap-1">
          <Button type="submit" variant="secondary">
            Re-match existing documents
          </Button>
          <p className="text-xs text-slate-400">
            Re-runs patient matching on all documents in the review queue using
            the current roster.
          </p>
        </form>
      </Card>

      <Card padding="p-6" className="mb-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Add a patient</h2>
        <AddPatient />
      </Card>

      <h2 className="mb-3 text-base font-semibold text-slate-900">
        Imported patients ({patients.length}
        {patients.length === 100 ? "+, showing first 100" : ""})
      </h2>

      {patients.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-slate-500">
            No patients imported yet.
          </p>
        </Card>
      ) : (
        <Card padding="p-0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Last name</th>
                <th className="px-4 py-3">First name</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Medicare</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => <PatientRow key={p.id} p={p} />)}
            </tbody>
          </table>
        </Card>
      )}
    </section>
  );
}
