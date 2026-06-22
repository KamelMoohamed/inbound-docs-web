import { LegalDoc } from "@/components/marketing/LegalDoc";

export const metadata = {
  title: "Privacy Policy — CliniDoc",
  description:
    "How we handle personal and health information under the Privacy Act 1988 (Cth) and the Australian Privacy Principles.",
};

const link = "font-medium text-indigo-600 hover:text-indigo-700";

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      updated="21 June 2026"
      intro={
        <>
          This policy describes how we handle personal and health information under the Privacy Act 1988 (Cth)
          and the Australian Privacy Principles (APPs).
        </>
      }
      sections={[
        {
          heading: "Who we are",
          body: (
            <>
              Kamel Kamel (ABN 17 732 182 203). We provide a service that ingests, processes and files clinical
              documents on behalf of medical practices. Privacy enquiries:{" "}
              <a className={link} href="mailto:privacy@clinidoc.com.au">privacy@clinidoc.com.au</a>.
            </>
          ),
        },
        {
          heading: "Information we handle",
          body: (
            <>
              We process health information (a category of sensitive information) contained in clinical documents
              — patient identifiers, document type, clinical findings — strictly on behalf of, and under the
              authority of, the medical practice that engages us.
            </>
          ),
        },
        {
          heading: "How we use it",
          body: (
            <>
              We use documents only to triage, match and file them for the practice that sent them. We do not
              reuse patient data to train AI models or for any other practice.
            </>
          ),
        },
        {
          heading: "Use of artificial intelligence",
          body: (
            <>
              We use an AI service to extract fields from documents. AI-assisted output is always reviewed and
              confirmed by a person before filing (human-in-the-loop) — no decision that significantly affects an
              individual is made solely by a computer. See our{" "}
              <a className={link} href="/sub-processors">sub-processor list</a>.
            </>
          ),
        },
        {
          heading: "Overseas disclosure",
          body: (
            <>
              Some processing occurs outside Australia: our AI extraction provider and certain communication
              providers operate overseas. We take reasonable steps, including contractual safeguards, to ensure
              these recipients handle information consistently with the APPs, and we remain accountable for it.
              Health data at rest is stored onshore in Australia (Sydney).
            </>
          ),
        },
        {
          heading: "Security",
          body: (
            <>
              We protect information with encryption in transit and at rest, role-based access control, per-tenant
              isolation, audit logging, and prompt deletion of raw documents after filing.
            </>
          ),
        },
        {
          heading: "Notifiable data breaches",
          body: (
            <>
              If a data breach is likely to result in serious harm, we assess it and, where required, notify the
              Office of the Australian Information Commissioner (OAIC) and affected individuals as soon as
              practicable, in line with the Notifiable Data Breaches scheme.
            </>
          ),
        },
        {
          heading: "Access and correction",
          body: (
            <>
              Individuals may request access to, or correction of, their personal information by contacting the
              relevant medical practice; we support practices in responding to these requests.
            </>
          ),
        },
        {
          heading: "Contact & complaints",
          body: (
            <>
              Contact <a className={link} href="mailto:privacy@clinidoc.com.au">privacy@clinidoc.com.au</a>. You
              may also complain to the OAIC at{" "}
              <a className={link} href="https://www.oaic.gov.au" target="_blank" rel="noreferrer">oaic.gov.au</a>.
            </>
          ),
        },
      ]}
    />
  );
}
