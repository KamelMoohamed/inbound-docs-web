import React from "react";

export type HelpSection = {
  heading: string;
  body: React.ReactNode;
  steps?: string[];
};

export function HelpDoc({
  title,
  sections,
}: {
  title: string;
  sections: HelpSection[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Help</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
      </header>

      <div className="mt-10 divide-y divide-slate-100">
        {sections.map((s) => (
          <section key={s.heading} className="py-7 first:pt-0">
            <h2 className="text-lg font-semibold text-slate-900">{s.heading}</h2>
            <div className="mt-2 text-base leading-relaxed text-slate-600">{s.body}</div>
            {s.steps && (
              <ol className="mt-4 space-y-2">
                {s.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-base text-slate-600">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
