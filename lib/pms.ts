export type Tone = "green" | "amber" | "gray";

export function tierLabel(tier: string): string {
  return tier === "write_back" ? "Auto-file into PMS"
    : tier === "roster" ? "Roster sync only"
    : "Export mode (any PMS)";
}
export function tierTone(tier: string): Tone {
  return tier === "write_back" ? "green" : tier === "roster" ? "amber" : "gray";
}
export function statusTone(status: string): Tone {
  return status === "live" ? "green" : status === "beta" ? "amber" : "gray";
}
export function capabilityLabel(cap: string): string {
  const map: Record<string, string> = {
    "roster.read": "Syncs patient roster",
    "patient.search": "Live patient lookup",
    "document.write": "Files documents",
    "task.create": "Creates provider tasks",
    "result.acknowledge": "Acknowledges results",
  };
  return map[cap] ?? cap;
}
