import { Section } from "@/components/marketing/Section";
import { StatTile } from "@/components/marketing/StatTile";
import { CTA } from "@/components/marketing/CTA";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Customers",
  description:
    "See how a busy Australian general practice clears its inbound document backlog with CliniDoc — AI triage, patient matching and write-back to the PMS.",
  path: "/customers",
});

const stats: [string, string, string][] = [
  ["87%", "Auto-ready rate", "docs filed with one click"],
  ["85%", "Staff time saved", "per week on document filing"],
  ["0", "Documents lost", "since go-live"],
  ["< 2 min", "Avg. review time", "down from ~15 min"],
];

const challenges: [string, string][] = [
  ["Name mismatches", "Specialist referrals use a patient’s legal name while the PMS holds a preferred name, causing missed matches."],
  ["Missing Medicare numbers", "Pathology results rarely include them, making matching entirely name-and-DOB dependent."],
  ["Urgency blindness", "Urgent results sit in the same pile as routine letters, with no automated triage."],
  ["No audit trail", "No systematic record of who filed what and when — a medico-legal risk."],
  ["Lost documents", "Faxes occasionally fail to transmit completely, with no way to detect or recover them."],
];

const beforeAfter: [string, string][] = [
  ["2–3 hours per day on document sorting and filing", "~25 minutes per day to process the same volume"],
  ["Manual patient lookup in the PMS for every document", "AI matches the patient automatically; staff verify and confirm"],
  ["No automated urgency triage — all documents treated equally", "Urgent results surface at the top of the queue automatically"],
  ["Documents occasionally lost or mis-filed under similar names", "Every document stored permanently — nothing can be lost"],
  ["No systematic audit trail for medico-legal compliance", "Full audit log: who filed what, when, and with what changes"],
  ["Filing backlog on Mondays after weekend fax accumulation", "Weekend documents queued and ready Monday morning"],
];

const timeline: [string, string, string][] = [
  ["Day 1 — AM", "1 hr", "Account created; eFax number assigned; forwarding rule set on the pathology email address."],
  ["Day 1 — PM", "30 min", "Patient roster imported from the PMS; API connection authorised so the roster syncs automatically."],
  ["Day 2", "30 min", "Staff walked through the review queue; test faxes confirm the end-to-end flow into the PMS."],
  ["Week 1", "Ongoing", "Live on all inbound documents, with support available by email throughout."],
];

export default function CustomersPage() {
  return (
    <>
      <Section className="max-w-4xl">
        <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
          Illustrative scenario
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          How a busy Melbourne practice cut document filing time by 85%
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          A six-GP family practice processes more than 200 inbound clinical documents every week — pathology
          results, specialist letters, discharge summaries and referrals — arriving by fax and email. Before
          CliniDoc, two practice managers spent almost three hours every day sorting, matching and filing each
          one. Here’s how a typical practice gets that time back.
        </p>
        <p className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-500">
          This is an illustrative example built from the CliniDoc workflow and representative practice volumes,
          not an account of a specific named customer. Figures show expected outcomes for a practice of this size.
        </p>
      </Section>

      <Section className="bg-slate-50">
        <h2 className="text-center text-2xl font-bold text-slate-900">Results at a glance</h2>
        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, label, sub]) => (
            <StatTile key={label} value={value} label={label} sub={sub} />
          ))}
        </div>
      </Section>

      <Section className="max-w-4xl">
        <h2 className="text-2xl font-bold text-slate-900">The challenge</h2>
        <p className="mt-3 text-slate-600">
          A typical week meant the fax machine printing continuously from 7&nbsp;am. Reception would collect the
          pile, sort it by type, then spend hours cross-referencing names and dates of birth against the PMS before
          filing. Common issues included:
        </p>
        <dl className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {challenges.map(([q, a]) => (
            <div key={q} className="px-5 py-4">
              <dt className="font-medium text-slate-900">{q}</dt>
              <dd className="mt-1 text-sm text-slate-600">{a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section className="max-w-4xl">
        <h2 className="text-2xl font-bold text-slate-900">The solution</h2>
        <p className="mt-3 text-slate-600">
          CliniDoc connects in a single afternoon: point the dedicated eFax number at CliniDoc’s ingest endpoint,
          and add a forwarding rule on the pathology email address. No on-premise software, and no changes to how
          specialists send documents.
        </p>
        <p className="mt-4 text-slate-600">
          Every inbound document is stored immediately in Australian-based object storage, then read by Claude
          vision in a single pass to identify the patient, document type, clinical urgency, and a plain-English
          summary of the key finding. Extracted fields are scored against the practice roster using fuzzy name
          matching, exact DOB and Medicare comparison, and phonetic matching — so a referral for “Caitlin Smith”
          correctly matches “Katelyn Smith” in the PMS. High-confidence documents are marked auto-ready; anything
          ambiguous is flagged for attention.
        </p>
        <p className="mt-4 text-slate-600">
          Staff see only the review queue — a prioritised list with urgent documents at the top. Auto-ready
          documents confirm in a single click; flagged documents show the original image, extracted fields and a
          suggested match side-by-side so staff can verify or correct before filing. Once confirmed, the document
          is written directly into the patient’s record. <strong>A human confirms every document — no decision is
          made solely by a computer.</strong>
        </p>
      </Section>

      <Section className="max-w-4xl">
        <h2 className="text-2xl font-bold text-slate-900">Before and after</h2>
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">Before CliniDoc</div>
            <div className="px-5 py-3 text-sm font-semibold text-indigo-700">After CliniDoc</div>
          </div>
          {beforeAfter.map(([before, after]) => (
            <div key={before} className="grid grid-cols-1 divide-y divide-slate-100 border-t border-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="px-5 py-4 text-sm text-slate-600">{before}</div>
              <div className="px-5 py-4 text-sm text-slate-900">{after}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="max-w-4xl">
        <h2 className="text-2xl font-bold text-slate-900">Live within one business day</h2>
        <p className="mt-3 text-slate-600">No third-party IT consultants, and no changes to existing fax hardware or internet setup.</p>
        <ol className="mt-6 space-y-4">
          {timeline.map(([when, dur, what]) => (
            <li key={when} className="flex gap-4 rounded-xl border border-slate-200 p-5">
              <div className="shrink-0">
                <div className="text-sm font-semibold text-slate-900">{when}</div>
                <div className="text-xs font-medium text-indigo-600">{dur}</div>
              </div>
              <p className="text-sm text-slate-600">{what}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="bg-slate-50 text-center">
        <h2 className="text-2xl font-bold text-slate-900">See it on your own documents</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Start free with trial credits — enough to process a typical week of inbound documents — or book a demo
          and we’ll walk you through CliniDoc on your workflow.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <CTA href="/signup">Start free</CTA>
          <CTA href="/contact" variant="secondary">Book a demo</CTA>
        </div>
      </Section>
    </>
  );
}
