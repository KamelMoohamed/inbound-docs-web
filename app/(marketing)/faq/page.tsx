import { Section } from "@/components/marketing/Section";
import { CTA } from "@/components/marketing/CTA";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Answers for practice managers evaluating CliniDoc — setup time, data safety, what happens when the AI is unsure, contracts, support and PMS integrations.",
  path: "/faq",
});

const groups: { heading: string; faqs: [string, string][] }[] = [
  {
    heading: "Getting started",
    faqs: [
      ["How long does setup take?", "Most practices are live within one business day. Setup is two steps — point your eFax number at CliniDoc and add a forwarding rule on your pathology email — and takes under two hours. No on-premise software and no IT consultants required."],
      ["Do we have to change our fax number or how specialists send us documents?", "No. You keep your existing workflow. Documents keep arriving the way they always have; CliniDoc simply ingests them, triages them and files them for you."],
      ["Will this disrupt the practice while we switch over?", "No. You can run CliniDoc alongside your current process and move channels across one at a time. Nothing changes for the clinicians or for the people sending you documents."],
    ],
  },
  {
    heading: "Accuracy & safety",
    faqs: [
      ["What happens if the AI gets a match wrong?", "It can’t file silently. Only high-confidence documents are marked auto-ready; anything ambiguous is flagged for a staff member, who sees the original image, the extracted fields and a suggested patient match side-by-side to verify or correct before filing. A human confirms every single document — no decision is made solely by a computer."],
      ["How does it match patients when names don’t line up?", "Matching combines fuzzy name matching, exact date-of-birth and Medicare comparison, and phonetic matching — so a referral for “Caitlin Smith” correctly reaches “Katelyn Smith” in your PMS, and a “Marie” on a specialist letter still finds your “Maree”."],
      ["Are urgent results handled differently?", "Yes. CliniDoc detects clinical urgency and surfaces urgent results at the top of the review queue, so abnormal blood panels and critical imaging don’t sit in the same pile as routine letters."],
      ["Can a document ever be lost?", "No. Every inbound document is stored permanently the moment it arrives, before any processing. If a fax fails to transmit completely, it’s still captured and flagged rather than silently dropped."],
    ],
  },
  {
    heading: "Privacy, security & compliance",
    faqs: [
      ["Where is our patient data stored?", "Exclusively on Australian servers. Clinical document data is never processed or stored offshore. Data is encrypted in transit (TLS 1.2+) and at rest."],
      ["Is there an audit trail for medico-legal compliance?", "Yes. Every action on every document is recorded in a tamper-evident audit log — who filed what, when, and with what changes — accessible to practice owners and administrators."],
      ["How is AI use disclosed to patients?", "CliniDoc’s privacy policy includes an explicit AI-use and overseas-disclosure section, in line with the Australian Privacy Principles. See our Privacy page and DPA for the full detail."],
      ["Who can access documents and settings?", "Access is role-based, with short-lived session tokens and automatic re-authentication after inactivity. Larger plans add SSO."],
    ],
  },
  {
    heading: "Integrations",
    faqs: [
      ["Which practice management systems do you support?", "CliniDoc writes back to supported systems including Cliniko, Halaxy, Best Practice and MedicalDirector. For any system we don’t yet write back to, export mode lets your team file documents wherever they need to."],
      ["What if our PMS isn’t listed?", "You can still use CliniDoc in export mode today, and request your system from the Integrations page so we can prioritise it."],
    ],
  },
  {
    heading: "Plans, contracts & support",
    faqs: [
      ["Is there a free trial?", "Yes — verified accounts get trial credits so you can process real documents before you pay anything."],
      ["Is there a lock-in contract?", "No lock-in and no setup fees. You can change plans or stop at any time."],
      ["What happens to our data if we cancel?", "Your data remains yours. You can export your documents and audit history, and we delete your data on request after you leave."],
      ["What support do we get?", "All plans include email support, with priority and dedicated support plus guided onboarding and an SLA on higher tiers. See Pricing for what’s included on each plan."],
    ],
  },
];

export default function FaqPage() {
  return (
    <Section className="max-w-3xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Frequently asked questions</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          What practice managers ask before bringing CliniDoc into their clinic. For pricing-specific questions,
          see the <a href="/pricing" className="text-indigo-600 hover:text-indigo-700">Pricing</a> page.
        </p>
      </div>

      <div className="mt-12 space-y-12">
        {groups.map(({ heading, faqs }) => (
          <div key={heading}>
            <h2 className="text-xl font-bold text-slate-900">{heading}</h2>
            <dl className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
              {faqs.map(([q, a]) => (
                <div key={q} className="px-5 py-4">
                  <dt className="font-medium text-slate-900">{q}</dt>
                  <dd className="mt-1 text-sm text-slate-600">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-slate-600">Still have a question?</p>
        <div className="mt-4 flex justify-center gap-3">
          <CTA href="/contact">Book a demo</CTA>
          <CTA href="/signup" variant="secondary">Start free</CTA>
        </div>
      </div>
    </Section>
  );
}
