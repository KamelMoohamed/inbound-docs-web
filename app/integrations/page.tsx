import { publicApi } from "../../lib/api";
import { PmsCard } from "../../components/PmsCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const catalog = await publicApi.pmsCatalog();
  const writeBack = catalog.filter((c) => c.tier === "write_back");
  const roster = catalog.filter((c) => c.tier === "roster");
  const exportOnly = catalog.filter((c) => c.tier === "export_only");

  return (
    <main className="max-w-4xl mx-auto p-8 flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold">Supported practice software</h1>
        <p className="text-gray-600 mt-1">
          We work with every clinic. Connected PMSes get documents filed automatically — and if yours
          isn&apos;t here yet, you can start today in export mode and we&apos;ll notify you when it&apos;s live.
        </p>
      </header>

      {writeBack.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Auto-file into your PMS</h2>
          <div className="grid sm:grid-cols-2 gap-4">{writeBack.map((e) => <PmsCard key={e.key} entry={e} />)}</div>
        </section>
      )}
      {roster.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Roster sync</h2>
          <div className="grid sm:grid-cols-2 gap-4">{roster.map((e) => <PmsCard key={e.key} entry={e} />)}</div>
        </section>
      )}
      <section>
        <h2 className="font-semibold mb-2">Works with any PMS</h2>
        <div className="grid sm:grid-cols-2 gap-4">{exportOnly.map((e) => <PmsCard key={e.key} entry={e} />)}</div>
      </section>

      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 flex items-center justify-between">
        <p className="text-sm">Don&apos;t see your PMS?</p>
        <Link href="/integrations/request" className="text-sm font-medium text-blue-600 underline">Request it →</Link>
      </div>
    </main>
  );
}
