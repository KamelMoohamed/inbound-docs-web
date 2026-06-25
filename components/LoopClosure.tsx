function Pill({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${
        done
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {done ? "✓" : "—"} {label}
    </span>
  );
}

export function LoopClosure({
  pms_filing_id,
  pms_task_id,
  pms_acknowledged_at,
}: {
  pms_filing_id?: string | null;
  pms_task_id?: string | null;
  pms_acknowledged_at?: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      <Pill done={!!pms_filing_id} label="Filed" />
      <Pill done={!!pms_task_id} label="Task" />
      <Pill done={!!pms_acknowledged_at} label="Ack" />
    </div>
  );
}
