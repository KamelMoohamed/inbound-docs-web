import { api } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExportQueueTable } from "@/components/ExportQueueTable";
import { TruncationBanner } from "@/components/TruncationBanner";

export const dynamic = "force-dynamic";

export default async function ExportQueuePage() {
  const { items, total } = await api.exportPending();

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Export queue"
        subtitle="Confirmed documents waiting to be filed manually in your PMS."
        actions={
          <div className="flex items-center gap-3">
            {total > 0 && (
              <a
                href="/api/export/bundle"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download bundle
              </a>
            )}
            <Badge tone="muted">{total} pending</Badge>
          </div>
        }
      />

      {total > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <strong className="font-medium text-slate-800">How to file:</strong>{" "}
          Download the bundle — it contains smart-named PDFs, an{" "}
          <code className="rounded bg-white px-1 py-0.5 text-xs font-mono border border-slate-200">index.csv</code> manifest,
          and a printable <code className="rounded bg-white px-1 py-0.5 text-xs font-mono border border-slate-200">worklist.html</code>.
          File each document in your PMS, then select them here and click{" "}
          <strong className="font-medium">Mark filed in PMS</strong> to close the loop.
        </div>
      )}

      <ExportQueueTable items={items} />

      {total >= 200 && <TruncationBanner limit={200} noun="documents" />}
    </section>
  );
}
