import Link from "next/link";

export function Pagination({
  page,
  total,
  pageSize = 50,
  buildHref,
}: {
  page: number;
  total: number;
  pageSize?: number;
  buildHref: (page: number) => string;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <span className="text-slate-500">
        {from}–{to} of {total.toLocaleString()}
      </span>
      <div className="flex items-center gap-4">
        {page > 1 ? (
          <Link href={buildHref(page - 1)} className="text-indigo-600 hover:underline">
            ← Prev
          </Link>
        ) : (
          <span className="text-slate-300">← Prev</span>
        )}
        <span className="text-slate-400">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={buildHref(page + 1)} className="text-indigo-600 hover:underline">
            Next →
          </Link>
        ) : (
          <span className="text-slate-300">Next →</span>
        )}
      </div>
    </div>
  );
}
