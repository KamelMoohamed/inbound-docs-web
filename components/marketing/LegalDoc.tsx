import React from "react";

export type LegalSection = { heading: string; body: React.ReactNode };

/** Shared, readable layout for legal pages (Terms, DPA, …) — no typography plugin needed. */
export function LegalDoc({
  eyebrow = "Legal",
  title,
  updated,
  notice,
  intro,
  sections,
}: {
  eyebrow?: string;
  title: string;
  updated: string;
  notice?: React.ReactNode;
  intro?: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated {updated}</p>
      </header>

      {notice && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
          {notice}
        </div>
      )}

      {intro && (
        <div className="mt-8 text-base leading-relaxed text-slate-600">{intro}</div>
      )}

      <div className="mt-10 divide-y divide-slate-100">
        {sections.map((s, i) => (
          <section key={s.heading} className="py-7 first:pt-0">
            <div className="flex gap-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                {i + 1}
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900">{s.heading}</h2>
                <div className="mt-2 text-base leading-relaxed text-slate-600">{s.body}</div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
