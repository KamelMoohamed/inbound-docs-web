import { Section } from "@/components/marketing/Section";
import { CTA } from "@/components/marketing/CTA";
import { pageMetadata } from "@/lib/seo";

type Tier = {
  name: string;
  price: string;
  period?: string;
  docs: string;
  blurb: string;
  featured?: boolean;
  cta: { label: string; href: string };
  features: string[];
};

const tiers: Tier[] = [
  {
    name: "Starter",
    price: "A$200",
    period: "/mo",
    docs: "2,000 documents / month",
    blurb: "Single-site practices getting started.",
    cta: { label: "Start free", href: "/signup" },
    features: ["1 incoming channel", "PMS export mode", "Patient & provider matching", "Email support"],
  },
  {
    name: "Growth",
    price: "A$500",
    period: "/mo",
    docs: "5,000 documents / month",
    blurb: "Busy practices that want documents filed automatically.",
    featured: true,
    cta: { label: "Start free", href: "/signup" },
    features: ["Multiple channels", "PMS write-back", "Urgent detection & escalation", "Priority support"],
  },
  {
    name: "Scale",
    price: "A$1,000",
    period: "/mo",
    docs: "10,000 documents / month",
    blurb: "Groups, PHNs and multi-site workflows.",
    cta: { label: "Talk to us", href: "/contact" },
    features: ["Unlimited channels", "SSO & role-based access", "SLA & guided onboarding", "Dedicated support"],
  },
];

const faqs: [string, string][] = [
  ["Is there a free trial?", "Yes — verified accounts get trial credits so you can process real documents before you pay a cent."],
  ["What counts as a document?", "One credit per document from upload, email, HL7 or FHIR. Secure messages are 2 credits, and faxes are 5 credits per page. Your plan's monthly credits cover the document volumes shown above."],
  ["Do unused credits roll over?", "Yes. Unused credits roll into the next month up to twice your monthly allowance, so a quiet month isn't wasted."],
  ["What happens if I go over?", "We never silently drop documents. You can top up credits or move to a higher plan at any time, and we'll flag you well before you run out."],
  ["Can I change plans?", "Anytime — upgrade or downgrade from the billing page and the change takes effect on your next cycle."],
];

export const metadata = pageMetadata({
  title: "Pricing",
  description: "Simple, usage-based pricing for clinical document triage. Start free with trial credits, then pay per document processed.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <Section>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Simple, usage-based pricing</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Start free with trial credits, then pay for what you process. No setup fees, no lock-in.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`flex flex-col rounded-xl border p-6 ${
              t.featured ? "border-indigo-600 shadow-lg ring-1 ring-indigo-600/10" : "border-slate-200"
            }`}
          >
            {t.featured && (
              <div className="mb-3 inline-flex w-fit rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </div>
            )}
            <h3 className="text-lg font-semibold text-slate-900">{t.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900">{t.price}</span>
              {t.period && <span className="text-sm font-medium text-slate-500">{t.period}</span>}
            </div>
            <div className="mt-1 text-sm font-medium text-indigo-600">{t.docs}</div>
            <p className="mt-3 text-sm text-slate-600">{t.blurb}</p>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-600">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span aria-hidden className="mt-0.5 text-indigo-600">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-2">
              <CTA href={t.cta.href} variant={t.featured ? "primary" : "secondary"}>
                {t.cta.label}
              </CTA>
            </div>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-slate-500">
        All plans include onshore storage in Australia, encryption in transit and at rest, a full audit trail,
        and human-in-the-loop review. Prices in AUD, exclusive of GST.
      </p>

      <div className="mx-auto mt-16 max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900">Pricing FAQ</h2>
        <dl className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {faqs.map(([q, a]) => (
            <div key={q} className="px-5 py-4">
              <dt className="font-medium text-slate-900">{q}</dt>
              <dd className="mt-1 text-sm text-slate-600">{a}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-12 text-center">
        <p className="text-slate-600">Not sure which plan fits your volume?</p>
        <div className="mt-4 flex justify-center gap-3">
          <CTA href="/signup">Start free</CTA>
          <CTA href="/contact" variant="secondary">Talk to us</CTA>
        </div>
      </div>
    </Section>
  );
}
