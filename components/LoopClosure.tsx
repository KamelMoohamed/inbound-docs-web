export function LoopClosure({
  pms_filing_id,
  pms_task_id,
  pms_acknowledged_at,
}: {
  pms_filing_id?: string | null;
  pms_task_id?: string | null;
  pms_acknowledged_at?: string | null;
}) {
  const filed = pms_filing_id ? "Filed ✓" : "Filed —";
  const task = pms_task_id ? "Task ✓" : "Task —";
  const ack = pms_acknowledged_at ? "Acknowledged ✓" : "Acknowledged —";
  return (
    <p className="text-sm text-slate-600">{filed} · {task} · {ack}</p>
  );
}
