export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatTurnaround(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function buildOrgAuditQuery(filters: { from?: string; to?: string; type?: string; actor?: string; page?: number }): string {
  const q = new URLSearchParams();
  if (filters.from) q.set("from", filters.from);
  if (filters.to) q.set("to", filters.to);
  if (filters.type) q.set("type", filters.type);
  if (filters.actor) q.set("actor", filters.actor);
  if (filters.page) q.set("page", String(filters.page));
  return q.toString();
}
