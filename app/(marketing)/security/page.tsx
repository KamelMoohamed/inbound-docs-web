import { Section } from "@/components/marketing/Section";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import Link from "next/link";

const controls = [
  ["Onshore data residency", "All health data — database, document storage and backups — is hosted in Australia (Sydney)."],
  ["Encryption everywhere", "TLS in transit and AES-256 / KMS encryption at rest for the database, object storage and backups."],
  ["Access control & isolation", "Role-based access, least privilege and strict per-practice (tenant) data isolation."],
  ["Multi-factor authentication", "MFA available for all accounts and enforced for privileged roles."],
  ["Audit logging", "Every document access and state change is logged to support access and correction requests."],
  ["Data minimisation", "Raw documents are purged after filing and identifiers de-identified when no longer needed."],
];

export const metadata = {
  title: "Security & Compliance — CliniDoc",
  description: "Onshore hosting, encryption, MFA, audit logging and privacy controls for Australian health information.",
};

export default function SecurityPage() {
  return (
    <Section>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Security &amp; compliance</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          We handle health information under the Privacy Act 1988 and the Australian Privacy Principles (APPs),
          and align our controls to the ACSC Essential Eight.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {controls.map(([t, b]) => <FeatureCard key={t} title={t} body={b} />)}
      </div>
      <div className="mx-auto mt-12 max-w-2xl rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        <p><strong>AI processing.</strong> We use AI to extract document fields; output is always reviewed and confirmed
        by a person before filing. We do not use patient data to train models. See our{" "}
        <Link href="/sub-processors" className="text-indigo-600 underline">sub-processors</Link> and{" "}
        <Link href="/privacy" className="text-indigo-600 underline">privacy policy</Link>.</p>
        <p className="mt-3"><strong>Breach response.</strong> We operate a Notifiable Data Breaches process and will notify the
        OAIC and affected individuals where required.</p>
      </div>
    </Section>
  );
}
