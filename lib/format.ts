export type Level = "high" | "medium" | "low";

export function confidenceLevel(score: number | null): Level {
  if (score == null) return "low";
  if (score >= 90) return "high";
  if (score >= 60) return "medium";
  return "low";
}

export function bandLabel(band: string | null): string {
  if (band === "auto_ready") return "Auto-ready";
  if (band === "attention") return "Needs attention";
  return "—";
}

export function creditTone(balance: number): "danger" | "warn" | "ok" {
  if (balance <= 100) return "danger";
  if (balance <= 500) return "warn";
  return "ok";
}
