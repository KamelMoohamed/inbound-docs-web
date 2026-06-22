import { Badge } from "./Badge";
import type { PmsCatalogEntry } from "../lib/types";
import { tierLabel, tierTone, statusTone, capabilityLabel } from "../lib/pms";
import type { Tone as PmsTone } from "../lib/pms";

type BadgeTone = "danger" | "warn" | "ok" | "muted";
function toBadgeTone(t: PmsTone): BadgeTone {
  return t === "green" ? "ok" : t === "amber" ? "warn" : "muted";
}

export function PmsCard({ entry }: { entry: PmsCatalogEntry }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{entry.display_name}</h3>
        <Badge tone={toBadgeTone(statusTone(entry.status))}>{entry.status}</Badge>
      </div>
      <div><Badge tone={toBadgeTone(tierTone(entry.tier))}>{tierLabel(entry.tier)}</Badge></div>
      {entry.capabilities.length > 0 && (
        <ul className="list-disc pl-5 text-sm text-slate-600">
          {entry.capabilities.map((c) => <li key={c}>{capabilityLabel(c)}</li>)}
        </ul>
      )}
      <p className="mt-auto text-xs text-slate-400">{entry.segment} · {entry.hosting}</p>
    </div>
  );
}
