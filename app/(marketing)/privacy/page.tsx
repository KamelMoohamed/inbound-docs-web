import { Section } from "@/components/marketing/Section";

export const metadata = {
  title: "Privacy Policy — Inbound Docs",
  description: "How we handle personal and health information under the Privacy Act 1988 (Cth) and the Australian Privacy Principles.",
};

const sections: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. Who we are",
    body: (
      <p>
        [Legal entity name, ABN, contact]. We provide a service that ingests, processes and files clinical
        documents on behalf of medical practices. Privacy enquiries: [privacy@yourdomain].
      </p>
    ),
  },
  {
    heading: "2. Information we handle",
    body: (
      <p>
        We process health information (a category of sensitive information) contained in clinical documents —
        patient identifiers, document type, clinical findings — strictly on behalf of, and under the authority
        of, the medical practice that engages us.
      </p>
    ),
  },
  {
    heading: "3. How we use it",
    body: (
      <p>
        We use documents only to triage, match and file them for the practice that sent them. We do not reuse
        patient data to train AI models or for any other practice.
      </p>
    ),
  },
  {
    heading: "4. Use of artificial intelligence",
    body: (
      <p>
        We use an AI service to extract fields from documents. AI-assisted output is always reviewed and
        confirmed by a person before filing (human-in-the-loop) — no decision that significantly affects an
        individual is made solely by a computer. See our{" "}
        <a className="font-medium text-indigo-600 hover:text-indigo-700" href="/sub-processors">sub-processor list</a>.
      </p>
    ),
  },
  {
    heading: "5. Overseas disclosure",
    body: (
      <p>
        Some processing occurs outside Australia: our AI extraction provider and certain communication
        providers operate overseas. We take reasonable steps, including contractual safeguards, to ensure these
        recipients handle information consistently with the APPs, and we remain accountable for it. Health data
        at rest is stored onshore in Australia (Sydney).
      </p>
    ),
  },
  {
    heading: "6. Security",
    body: (
      <p>
        We protect information with encryption in transit and at rest, role-based access control, per-tenant
        isolation, audit logging, and prompt deletion of raw documents after filing.
      </p>
    ),
  },
  {
    heading: "7. Notifiable data breaches",
    body: (
      <p>
        If a data breach is likely to result in serious harm, we assess it and, where required, notify the
        Office of the Australian Information Commissioner (OAIC) and affected individuals as soon as
        practicable, in line with the Notifiable Data Breaches scheme.
      </p>
    ),
  },
  {
    heading: "8. Access and correction",
    body: (
      <p>
        Individuals may request access to, or correction of, their personal information by contacting the
        relevant medical practice; we support practices in responding to these requests.
      </p>
    ),
  },
  {
    heading: "9. Contact & complaints",
    body: (
      <p>
        Contact [privacy@yourdomain]. You may also complain to the OAIC at{" "}
        <a className="font-medium text-indigo-600 hover:text-indigo-700" href="https://www.oaic.gov.au" target="_blank" rel="noreferrer">oaic.gov.au</a>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <Section className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">
        Last updated: 21 June 2026. This policy describes how we handle personal and health information under
        the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).
      </p>

      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Owner:</strong> replace the bracketed details with your registered entity information before
        going live.
      </div>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-lg font-semibold text-slate-900">{s.heading}</h2>
            <div className="mt-2 text-slate-600 leading-relaxed">{s.body}</div>
          </section>
        ))}
      </div>
    </Section>
  );
}
