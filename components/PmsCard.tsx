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
    <div className="rounded-lg border border-gray-200 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{entry.display_name}</h3>
        <Badge tone={toBadgeTone(statusTone(entry.status))}>{entry.status}</Badge>
      </div>
      <Badge tone={toBadgeTone(tierTone(entry.tier))}>{tierLabel(entry.tier)}</Badge>
      {entry.capabilities.length > 0 && (
        <ul className="text-sm text-gray-600 list-disc pl-5">
          {entry.capabilities.map((c) => <li key={c}>{capabilityLabel(c)}</li>)}
        </ul>
      )}
      <p className="text-xs text-gray-400 mt-auto">{entry.segment} · {entry.hosting}</p>
    </div>
  );
}
