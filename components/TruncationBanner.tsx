export function TruncationBanner({ limit, noun = "results" }: { limit: number; noun?: string }) {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      Showing the first {limit} {noun}. Use filters or export data to see the rest.
    </p>
  );
}
