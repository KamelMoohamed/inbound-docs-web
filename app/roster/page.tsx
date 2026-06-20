import { importRosterAction } from "./actions";

export default function RosterPage() {
  return (
    <section className="max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Import patient roster</h1>
      <p className="mb-3 text-sm text-slate-500">
        CSV with columns: <code>external_id,first_name,last_name,dob,medicare_number</code>
      </p>
      <form action={importRosterAction} className="space-y-3">
        <input type="file" name="file" accept=".csv" required className="block w-full text-sm" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Import</button>
      </form>
    </section>
  );
}
