type Tone = "danger" | "warn" | "ok" | "muted";
const TONE: Record<Tone, string> = {
  danger: "bg-red-100 text-red-800",
  warn: "bg-amber-100 text-amber-800",
  ok: "bg-emerald-100 text-emerald-800",
  muted: "bg-slate-100 text-slate-700",
};
export function Badge({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${TONE[tone]}`}>{children}</span>;
}
