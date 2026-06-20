import { api } from "@/lib/api";
import { RosterImportForm } from "@/components/RosterImportForm";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  const patients = await api.searchPatients("");
  return (
    <section className="max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold">Patient roster</h1>
      <p className="mb-3 text-sm text-slate-500">
        Import a CSV with columns:{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">external_id,first_name,last_name,dob,medicare_number</code>
      </p>

      <RosterImportForm />

      <h2 className="mb-2 mt-8 text-sm font-semibold text-slate-700">
        Imported patients ({patients.length}
        {patients.length === 100 ? "+, showing first 100" : ""})
      </h2>
      {patients.length === 0 ? (
        <p className="rounded border border-slate-200 bg-white p-6 text-center text-slate-500">
          No patients imported yet.
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="p-2">Last name</th>
              <th className="p-2">First name</th>
              <th className="p-2">DOB</th>
              <th className="p-2">Medicare</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-2">{p.last_name}</td>
                <td className="p-2">{p.first_name}</td>
                <td className="p-2">{p.dob ?? "—"}</td>
                <td className="p-2 font-mono text-xs">{p.medicare_number ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
