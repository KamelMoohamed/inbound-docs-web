export function StatTile({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
      <div className="text-3xl font-bold text-indigo-600 sm:text-4xl">{value}</div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{label}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}
