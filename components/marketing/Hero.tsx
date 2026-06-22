import { CTA } from "./CTA";

export function Hero() {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Incoming clinical documents, triaged and filed — automatically.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Faxes, emails, pathology and specialist letters arrive, get matched to the right patient and
          provider, and land in your practice software. Your team confirms; we do the rest.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <CTA href="/signup">Start free</CTA>
          <CTA href="/contact" variant="secondary">Book a demo</CTA>
        </div>
        <p className="mt-4 text-xs text-slate-500">Hosted in Australia · Encrypted · Human-in-the-loop</p>
      </div>
    </div>
  );
}
