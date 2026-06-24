export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy aria-label="Loading page">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded bg-slate-200" />
        <div className="h-4 w-40 rounded bg-slate-100" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-slate-100" />
        ))}
      </div>
      <div className="h-48 rounded-lg bg-slate-100" />
    </div>
  );
}
