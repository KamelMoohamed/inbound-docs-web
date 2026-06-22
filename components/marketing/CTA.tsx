import Link from "next/link";

export function CTA({ href, children, variant = "primary" }: {
  href: string; children: React.ReactNode; variant?: "primary" | "secondary";
}) {
  const cls = variant === "primary"
    ? "bg-indigo-600 text-white hover:bg-indigo-700"
    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50";
  return (
    <Link href={href} className={`inline-flex items-center rounded-md px-5 py-2.5 text-sm font-semibold transition-colors ${cls}`}>
      {children}
    </Link>
  );
}
