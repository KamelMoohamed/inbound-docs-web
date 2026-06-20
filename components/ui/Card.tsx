export function Card({
  children,
  className,
  padding = "p-6",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${padding}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
