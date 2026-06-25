import Link from "next/link";

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
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: Accent;
  href?: string;
}) {
  const inner = (
    <>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-400">{hint}</div>}
    </>
  );
  const cls = `rounded-xl border border-slate-200 bg-white shadow-sm border-t-4 p-4 ${ACCENT[accent]}${href ? " hover:shadow-md transition-shadow" : ""}`;
  return href
    ? <Link href={href} className={cls}>{inner}</Link>
    : <div className={cls}>{inner}</div>;
}
