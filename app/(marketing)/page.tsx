import { Hero } from "@/components/marketing/Hero";
import { Section } from "@/components/marketing/Section";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { StatTile } from "@/components/marketing/StatTile";
import { CTA } from "@/components/marketing/CTA";

const stats: [string, string, string][] = [
  ["87%", "Auto-ready rate", "docs filed with one click"],
  ["85%", "Staff time saved", "per week on filing"],
  ["0", "Documents lost", "since go-live"],
  ["< 2 min", "Avg. review time", "down from ~15 min"],
];

const steps = [
  ["1 · Receive", "Documents arrive by fax, email, secure messaging, HL7 or FHIR — into one inbox."],
  ["2 · Understand", "AI extracts the patient, document type and urgency, and matches your roster."],
  ["3 · Confirm & file", "Your team confirms in seconds; the document is filed into your PMS with the loop closed."],
];

const features = [
  ["Patient & provider matching", "Fuzzy + phonetic matching against your roster so documents reach the right chart."],
  ["Urgent detection", "Clinically urgent results are flagged and escalated so nothing slips."],
  ["Works with your PMS", "Write-back to supported practice software, or export mode for everyone else."],
  ["Onshore & encrypted", "All health data stored in Australia, encrypted in transit and at rest."],
  ["Full audit trail", "Every access and state change is logged for access/correction requests."],
  ["Human-in-the-loop", "Staff confirm every document — no decision is made solely by a computer."],
];

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Section>
        <h2 className="text-center text-2xl font-bold text-slate-900">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(([t, b]) => <FeatureCard key={t} title={t} body={b} />)}
        </div>
      </Section>
      <Section className="bg-slate-50">
        <h2 className="text-center text-2xl font-bold text-slate-900">Built for clinical document workflows</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map(([t, b]) => <FeatureCard key={t} title={t} body={b} />)}
        </div>
      </Section>
      <Section>
        <h2 className="text-center text-2xl font-bold text-slate-900">What practices see with CliniDoc</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, label, sub]) => (
            <StatTile key={label} value={value} label={label} sub={sub} />
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Illustrative outcomes for a six-GP practice processing ~200 documents a week.{" "}
          <a href="/customers" className="font-medium text-indigo-600 hover:text-indigo-700">Read the full story →</a>
        </p>
      </Section>
      <Section className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Ready to clear the document backlog?</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">Start free, no credit card. Bring your first channel online in minutes.</p>
        <div className="mt-6 flex justify-center gap-3">
          <CTA href="/signup">Start free</CTA>
          <CTA href="/pricing" variant="secondary">See pricing</CTA>
        </div>
      </Section>
    </>
  );
}
