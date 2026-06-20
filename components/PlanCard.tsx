const PRICES: Record<string, number> = { starter: 200, growth: 500, scale: 1000 };

export function PlanCard({ planKey, monthlyCredits, current, action }:
  { planKey: string; monthlyCredits: number; current: boolean; action?: (formData: FormData) => void }) {
  const price = PRICES[planKey] ?? 0;
  return (
    <div className={`rounded-xl border p-5 ${current ? "border-indigo-500 ring-1 ring-indigo-200" : "border-slate-200"} bg-white`}>
      <div className="text-sm font-semibold uppercase tracking-wide text-indigo-700">{planKey}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">${price}<span className="text-base font-normal text-slate-500">/mo</span></div>
      <div className="mt-1 text-sm text-slate-600">{monthlyCredits.toLocaleString()} credits / month</div>
      <form action={action} className="mt-4">
        <input type="hidden" name="plan" value={planKey} />
        <button type="submit" disabled={current}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300">
          {current ? "Current plan" : `Choose ${planKey}`}
        </button>
      </form>
    </div>
  );
}
