import { Section } from "@/components/marketing/Section";
import { CTA } from "@/components/marketing/CTA";

export const metadata = {
  title: "About — Inbound Docs",
  description: "Clinical document triage built onshore for Australian medical practices.",
};

export default function AboutPage() {
  return (
    <Section className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">About Inbound Docs</h1>
      <div className="prose prose-slate mt-6">
        <p>Australian medical practices receive a relentless stream of inbound documents — pathology and
        radiology results, specialist letters, discharge summaries, referrals — across fax, email and secure
        messaging. Sorting, matching and filing them by hand is slow, error-prone, and a patient-safety risk
        when urgent results are missed.</p>
        <p>Inbound Docs triages that stream automatically and files it into your practice software, with a
        person confirming every document. We built it onshore, privacy-first, and for the realities of
        Australian clinical workflows.</p>
        <h2>Our principles</h2>
        <ul>
          <li><strong>Patient safety first</strong> — urgent results are surfaced, never buried.</li>
          <li><strong>Human-in-the-loop</strong> — AI assists; your team decides.</li>
          <li><strong>Privacy by design</strong> — onshore, encrypted, minimised.</li>
        </ul>
      </div>
      <div className="mt-8"><CTA href="/contact">Talk to us</CTA></div>
    </Section>
  );
}
