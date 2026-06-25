import { api } from "@/lib/api";
import { ReviewTable } from "@/components/ReviewTable";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { QueueToggle } from "@/components/QueueToggle";

export const dynamic = "force-dynamic";

const DOC_TYPES = ["pathology", "radiology", "specialist_letter", "discharge_summary", "referral", "other"];
const SOURCES = ["email", "efax", "fax", "upload", "sftp", "fhir", "hl7", "secure_msg"];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ mine?: string; page?: string; doc_type?: string; urgency?: string; source?: string }>;
}) {
  const params = await searchParams;
  const mine = !!params.mine;
  const page = Number(params.page ?? 1);
  const filters = { doc_type: params.doc_type, urgency: params.urgency, source: params.source };
  const { items, total } = mine
    ? await api.myQueue(page)
    : await api.listReview(page, filters);

  const buildFilterHref = (overrides: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    if (mine) q.set("mine", "1");
    const merged = { doc_type: params.doc_type, urgency: params.urgency, source: params.source, ...overrides };
    if (merged.doc_type) q.set("doc_type", merged.doc_type);
    if (merged.urgency) q.set("urgency", merged.urgency);
    if (merged.source) q.set("source", merged.source);
    q.set("page", "1");
    return `?${q.toString()}`;
  };

  const hasFilters = !!(params.doc_type || params.urgency || params.source);

  // Queue-defining context (no page) carried into each report so "Next in queue"
  // walks this same filtered list.
  const ctx = new URLSearchParams();
  if (mine) ctx.set("mine", "1");
  if (params.doc_type) ctx.set("doc_type", params.doc_type);
  if (params.urgency) ctx.set("urgency", params.urgency);
  if (params.source) ctx.set("source", params.source);
  const queryContext = ctx.toString();

  return (
    <section>
      <PageHeader
        title={mine ? "My queue" : "Documents to review"}
        actions={
          <>
            <QueueToggle mine={mine} />
            <Badge tone="muted">{total} total</Badge>
          </>
        }
      />

      {!mine && (
        <form method="GET" className="mb-4 flex flex-wrap items-end gap-2">
          <select name="doc_type" defaultValue={params.doc_type ?? ""}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">All types</option>
            {DOC_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
          </select>
          <select name="urgency" defaultValue={params.urgency ?? ""}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Any urgency</option>
            <option value="urgent">Urgent</option>
            <option value="routine">Routine</option>
          </select>
          <select name="source" defaultValue={params.source ?? ""}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">All channels</option>
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            Filter
          </button>
          {hasFilters && (
            <a href="?" className="text-sm text-slate-500 hover:underline">Clear</a>
          )}
        </form>
      )}

      <ReviewTable items={items} queryContext={queryContext} />
      <Pagination
        page={page}
        total={total}
        buildHref={(p) => buildFilterHref({ page: String(p) })}
      />
    </section>
  );
}
