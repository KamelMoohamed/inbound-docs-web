import Link from "next/link";
import type { ReviewItem } from "@/lib/types";
import { Badge } from "./Badge";
import { confidenceLevel, bandLabel } from "@/lib/format";

export function ReviewTable({ items }: { items: ReviewItem[] }) {
  if (items.length === 0)
    return <p className="rounded border border-slate-200 bg-white p-8 text-center text-slate-500">Nothing to review right now.</p>;
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-left text-slate-500">
          <th className="p-2">Type</th><th className="p-2">Urgency</th><th className="p-2">Status</th>
          <th className="p-2">Match</th><th className="p-2">Summary</th><th className="p-2"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((i) => (
          <tr key={i.id} className={`border-t border-slate-100 ${i.urgency === "urgent" ? "bg-red-50" : ""}`}>
            <td className="p-2">{i.doc_type ?? "—"}</td>
            <td className="p-2">{i.urgency === "urgent" ? <Badge tone="danger">Urgent</Badge> : <Badge>Routine</Badge>}</td>
            <td className="p-2">{i.review_band === "auto_ready"
              ? <Badge tone="ok">{bandLabel(i.review_band)}</Badge>
              : <Badge tone="warn">{bandLabel(i.review_band)}</Badge>}</td>
            <td className="p-2">{i.match_confidence == null ? "—"
              : <Badge tone={confidenceLevel(i.match_confidence) === "high" ? "ok" : "warn"}>{i.match_confidence.toFixed(0)}</Badge>}</td>
            <td className="p-2 text-slate-700">{i.summary ?? "—"}</td>
            <td className="p-2"><Link className="text-blue-600 underline" href={`/review/${i.id}`}>Open</Link></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
