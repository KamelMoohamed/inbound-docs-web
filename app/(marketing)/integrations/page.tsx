import { publicApi } from "@/lib/api";
import { PmsCard } from "@/components/PmsCard";
import { Section } from "@/components/marketing/Section";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Integrations",
  description: "We work with every clinic. Connected practice software gets documents filed automatically; everyone else can start today in export mode.",
  path: "/integrations",
});

export default async function IntegrationsPage() {
  const catalog = await publicApi.pmsCatalog();
  const writeBack = catalog.filter((c) => c.tier === "write_back");
  const roster = catalog.filter((c) => c.tier === "roster");
  const exportOnly = catalog.filter((c) => c.tier === "export_only");

  const groups = [
    {
      show: writeBack.length > 0,
      title: "Auto-file into your PMS",
      blurb: "Confirmed documents are written straight back into the patient's chart — no manual filing.",
      entries: writeBack,
    },
    {
      show: roster.length > 0,
      title: "Roster sync",
      blurb: "We sync your patient and provider roster so documents match to the right chart automatically.",
      entries: roster,
    },
    {
      show: true,
      title: "Works with any PMS",
      blurb: "No direct integration needed — confirm documents and export them into any practice software.",
      entries: exportOnly,
    },
  ];

  return (
    <Section className="flex flex-col gap-10">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Supported practice software</h1>
        <p className="mt-3 text-slate-600">
          We work with every clinic. Connected practice software gets documents filed automatically — and if
          yours isn&apos;t here yet, you can start today in export mode and we&apos;ll notify you the moment
          write-back goes live.
        </p>
      </header>

      {groups.filter((g) => g.show).map((g) => (
        <section key={g.title}>
          <h2 className="text-lg font-semibold text-slate-900">{g.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{g.blurb}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {g.entries.map((e) => <PmsCard key={e.key} entry={e} />)}
          </div>
        </section>
      ))}

      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="font-medium text-slate-900">Don&apos;t see your practice software?</p>
          <p className="mt-1 text-sm text-slate-600">Tell us what you use and we&apos;ll prioritise it.</p>
        </div>
        <Link
          href="/integrations/request"
          className="inline-flex items-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Request an integration →
        </Link>
      </div>
    </Section>
  );
}
