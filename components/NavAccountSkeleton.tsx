export function NavAccountSkeleton() {
  return (
    <div className="ml-auto flex items-center gap-3" aria-hidden>
      <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
      <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
      <div className="h-8 w-28 animate-pulse rounded bg-slate-200" />
    </div>
  );
}
