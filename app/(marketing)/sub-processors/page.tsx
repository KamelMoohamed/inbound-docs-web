import { Section } from "@/components/marketing/Section";
import { SUB_PROCESSORS } from "@/lib/sub-processors";

export const metadata = {
  title: "Sub-processors — Inbound Docs",
  description: "The third-party providers we engage to deliver clinical document triage, what each is used for, and where it operates.",
};

export default function SubProcessorsPage() {
  return (
    <Section className="max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sub-processors</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: 21 June 2026</p>
        <p className="mt-4 text-slate-600">
          To deliver our service we engage the third-party providers below. We maintain a data processing
          agreement (or equivalent data-handling terms) with each, and we remain accountable for how they
          handle information on our behalf. Health data at rest is stored onshore in Australia (Sydney);
          some providers process data overseas as noted.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              <th className="px-5 py-3 font-semibold">Provider</th>
              <th className="px-5 py-3 font-semibold">Purpose</th>
              <th className="px-5 py-3 font-semibold">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {SUB_PROCESSORS.map((s) => (
              <tr key={s.name} className="text-slate-700">
                <td className="px-5 py-3 font-medium text-slate-900">{s.name}</td>
                <td className="px-5 py-3">{s.purpose}</td>
                <td className="px-5 py-3 whitespace-nowrap">{s.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        We review this list as our service evolves. Questions about a provider, or our data-handling terms?
        See our <a className="font-medium text-indigo-600 hover:text-indigo-700" href="/privacy">Privacy Policy</a>{" "}
        or <a className="font-medium text-indigo-600 hover:text-indigo-700" href="/contact">contact us</a>.
      </p>
    </Section>
  );
}
