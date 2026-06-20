import Link from "next/link";
import type { ReviewItem } from "@/lib/types";
import { Badge } from "./Badge";
import { confidenceLevel, bandLabel } from "@/lib/format";
import { Card } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";

export function ReviewTable({ items }: { items: ReviewItem[] }) {
  if (items.length === 0)
    return <EmptyState message="Nothing to review right now — you're all caught up." />;
  return (
    <Card padding="p-0">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Urgency</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Patient</th>
            <th className="px-4 py-3">Match conf.</th>
            <th className="px-4 py-3">Summary</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr
              key={i.id}
              className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                i.urgency === "urgent" ? "border-l-4 border-l-red-500" : ""
              }`}
            >
              <td className="px-4 py-3 text-slate-700">{i.doc_type ?? "—"}</td>
              <td className="px-4 py-3">
                {i.urgency === "urgent" ? (
                  <Badge tone="danger">Urgent</Badge>
                ) : (
                  <Badge>Routine</Badge>
                )}
              </td>
              <td className="px-4 py-3">
                {i.review_band === "auto_ready" ? (
                  <Badge tone="ok">{bandLabel(i.review_band)}</Badge>
                ) : (
                  <Badge tone="warn">{bandLabel(i.review_band)}</Badge>
                )}
              </td>
              <td className="p-2 text-slate-700">
                {i.matched_patient ? `${i.matched_patient.last_name}, ${i.matched_patient.first_name}` : "—"}
              </td>
              <td className="px-4 py-3">
                {i.match_confidence == null ? (
                  "—"
                ) : (
                  <Badge
                    tone={
                      confidenceLevel(i.match_confidence) === "high"
                        ? "ok"
                        : "warn"
                    }
                  >
                    {i.match_confidence.toFixed(0)}%
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3 text-slate-700">{i.summary ?? "—"}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/review/${i.id}`}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
