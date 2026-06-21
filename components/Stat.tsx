type Accent = "indigo" | "red" | "emerald";

const ACCENT: Record<Accent, string> = {
  indigo: "border-t-indigo-500",
  red: "border-t-red-500",
  emerald: "border-t-emerald-500",
};

export function Stat({
  label,
  value,
  hint,
  accent = "indigo",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: Accent;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 p-4 ${ACCENT[accent]}`}
    >
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
