# Frontend Implementation Plan — Billing, Credits & Channels Console (Next.js)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **HOW TO FOLLOW THIS PLAN (read first).**
> This plan **upgrades the existing Next.js web app** (`clinidoc-web`) which is already migrated to JWT cookie auth. It adds: a **billing & credits** console (plan, balance, buy/upgrade via Stripe Checkout, transaction history), a **credit balance pill** in the nav, a **low-credit banner**, a **held-for-credits** queue view, **incoming-channel management**, a **usage** section on the dashboard, and an **account settings** page (change password).
>
> **Rules:** Do tasks in order; steps in order. When a step shows a file path + code block, create/modify that exact file with that exact code. When a step says **Run:**, run it and confirm the result. For tasks with tests, write the failing test first, see it fail, implement, see it pass, commit.
>
> **Prerequisite:** the **backend credits/subscriptions plan** (`2026-06-21-credits-subscriptions-backend.md`) is built and running, exposing `/billing/summary`, `/billing/transactions`, `/billing/checkout`, `/billing/portal`, `/review/held`, `/auth/change-password`, and the existing `/org/channels` CRUD. This plan calls those over HTTP via the server-only client; it adds no backend code.
>
> **Out of scope (excluded by request):** PMS, email verification, production/ops. Also deferred: audit-trail viewer (needs a backend endpoint not in scope), websocket live refresh, dark mode/i18n.

**Architecture:** Reads happen in **Server Components** through the existing server-only `api` (JWT from the httpOnly cookie). Mutations are **Server Actions**. Stripe Checkout/Portal are **redirects** — the action asks the backend for a hosted URL and `redirect()`s the browser to Stripe; the user returns to `/billing`. The Stripe **publishable key and card details never touch this app** — Stripe Checkout is hosted. Pure presentational helpers/components are unit-tested (Vitest + RTL); the flow is covered by Playwright.

**Tech Stack:** Next.js App Router + TypeScript, Tailwind, Zod (response parsing), Vitest + @testing-library/react + jsdom, Playwright. Existing UI primitives in `components/ui/*` (`Button`, `Card`, `FormField`, `PageHeader`, `EmptyState`).

## New routes & files

```
app/(main)/billing/page.tsx            # plan, balance, buy/upgrade, history (server component)
app/(main)/billing/actions.ts          # checkoutAction, portalAction (redirect to Stripe)
app/(main)/channels/page.tsx           # list incoming channels (server component)
app/(main)/channels/actions.ts         # create/update/delete channel
app/(main)/channels/ChannelForm.tsx    # client island: add-channel form
app/(main)/review/held/page.tsx        # held-for-credits queue (server component)
app/(main)/settings/page.tsx           # account settings (server component shell)
app/(main)/settings/actions.ts         # changePasswordAction
components/CreditPill.tsx               # balance pill for the nav
components/LowCreditBanner.tsx          # shown in the main layout when low/held
components/PlanCard.tsx                 # one plan tier (pure, tested)
lib/format.ts (modify)                 # creditTone() helper (pure, tested)
lib/types.ts (modify)                  # BillingSummary, CreditTxn, Channel, HeldDoc
lib/api.ts (modify)                    # billing/channels/held/changePassword calls
```

---

## Task 1: Types + server-only API calls

**Files:**
- Modify: `lib/types.ts`, `lib/api.ts`

- [ ] **Step 1: Add response types**

Append to `lib/types.ts`:
```ts
export const PlanInfo = z.object({
  key: z.string(), status: z.string(), monthlyCredits: z.number(),
  rolloverCap: z.number(), currentPeriodEnd: z.string(),
});
export const BillingSummary = z.object({
  balance: z.number(),
  plan: PlanInfo.nullable(),
  held: z.number(),
  plans: z.record(z.object({ monthlyCredits: z.number(), rolloverCap: z.number() })),
});
export type BillingSummary = z.infer<typeof BillingSummary>;

export const CreditTxn = z.object({
  id: z.string(), amount: z.number(), type: z.string(), reason: z.string(),
  documentId: z.string().nullable(), balanceAfter: z.number(), createdAt: z.string(),
});
export type CreditTxn = z.infer<typeof CreditTxn>;

export const Channel = z.object({
  id: z.string(), type: z.string(), address: z.string(),
  label: z.string().nullable(), active: z.boolean(),
  createdAt: z.string(), hasWebhookSecret: z.boolean(),
});
export type Channel = z.infer<typeof Channel>;

export const HeldDoc = z.object({
  id: z.string(), source: z.string(), doc_type: z.string().nullable(),
  credit_cost: z.number().nullable(), created_at: z.string(),
});
export type HeldDoc = z.infer<typeof HeldDoc>;
```

- [ ] **Step 2: Add API methods**

In `lib/api.ts`, add the new imports to the existing type import line:
```ts
import { ReviewItem, ReviewDetail, Patient, Metrics, OrgUser, FailedDoc,
         BillingSummary, CreditTxn, Channel, HeldDoc } from "./types";
```
Add these entries to the `api` object (alongside the existing ones):
```ts
  billingSummary: async () => BillingSummary.parse(await get("/billing/summary")),
  creditTxns:     async () => CreditTxn.array().parse(await get("/billing/transactions")),
  checkout:       (plan: string) => post("/billing/checkout", { plan }) as Promise<{ url: string }>,
  portal:         () => post("/billing/portal") as Promise<{ url: string }>,
  listChannels:   async () => Channel.array().parse(await get("/org/channels")),
  createChannel:  (body: { type: string; address: string; label?: string; webhookSecret?: string }) =>
                    post("/org/channels", body),
  updateChannel:  async (id: string, body: { label?: string; active?: boolean }) =>
                    fetch(`${BASE}/org/channels/${id}`, { method: "PATCH", headers: await authHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  deleteChannel:  async (id: string) =>
                    fetch(`${BASE}/org/channels/${id}`, { method: "DELETE", headers: await authHeaders() }).then(r => r.json()),
  listHeld:       async () => HeldDoc.array().parse(await get("/review/held")),
  changePassword: (currentPassword: string, newPassword: string) =>
                    post("/auth/change-password", { currentPassword, newPassword }),
```

- [ ] **Step 3: Commit**
```bash
git add lib/types.ts lib/api.ts
git commit -m "feat(web): types + api client for billing, channels, held docs, change-password"
```

---

## Task 2: Pure helper — creditTone (tested)

**Files:**
- Modify: `lib/format.ts`; Create: `tests/creditTone.test.ts`

- [ ] **Step 1: Failing test**

`tests/creditTone.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { creditTone } from "@/lib/format";

describe("creditTone", () => {
  it("flags low balances", () => {
    expect(creditTone(0)).toBe("danger");
    expect(creditTone(50)).toBe("danger");     // <= 100
    expect(creditTone(300)).toBe("warn");       // <= 500
    expect(creditTone(5000)).toBe("ok");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/creditTone.test.ts`
Expected: FAIL ("creditTone is not exported").

- [ ] **Step 3: Implement**

Append to `lib/format.ts`:
```ts
export function creditTone(balance: number): "danger" | "warn" | "ok" {
  if (balance <= 100) return "danger";
  if (balance <= 500) return "warn";
  return "ok";
}
```

- [ ] **Step 4: Run + commit**
```bash
npx vitest run tests/creditTone.test.ts   # → PASS
git add lib/format.ts tests/creditTone.test.ts
git commit -m "feat(web): creditTone helper + test"
```

---

## Task 3: PlanCard component (pure, tested)

**Files:**
- Create: `components/PlanCard.tsx`, `tests/planCard.test.tsx`

- [ ] **Step 1: Failing test**

`tests/planCard.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { PlanCard } from "@/components/PlanCard";

test("renders plan name, price, credits, and CTA label", () => {
  render(<PlanCard planKey="growth" monthlyCredits={5000} current={false} />);
  expect(screen.getByText(/growth/i)).toBeTruthy();
  expect(screen.getByText(/5,000 credits/i)).toBeTruthy();
  expect(screen.getByRole("button", { name: /choose growth/i })).toBeTruthy();
});

test("shows 'current plan' and disables the button when current", () => {
  render(<PlanCard planKey="starter" monthlyCredits={2000} current={true} />);
  expect(screen.getByText(/current plan/i)).toBeTruthy();
  expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/planCard.test.tsx`
Expected: FAIL ("Cannot find module '@/components/PlanCard'").

- [ ] **Step 3: Implement**

`components/PlanCard.tsx`:
```tsx
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
```

- [ ] **Step 4: Run + commit**
```bash
npx vitest run tests/planCard.test.tsx   # → PASS
git add components/PlanCard.tsx tests/planCard.test.tsx
git commit -m "feat(web): PlanCard component + tests"
```

---

## Task 4: Billing page + checkout/portal actions

**Files:**
- Create: `app/(main)/billing/actions.ts`, `app/(main)/billing/page.tsx`

- [ ] **Step 1: Server actions (redirect to Stripe-hosted pages)**

`app/(main)/billing/actions.ts`:
```ts
"use server";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

export async function checkoutAction(formData: FormData) {
  const plan = String(formData.get("plan"));
  const { url } = await api.checkout(plan);
  redirect(url); // Stripe-hosted Checkout
}

export async function portalAction() {
  const { url } = await api.portal();
  redirect(url); // Stripe-hosted Customer Portal
}
```

- [ ] **Step 2: Billing page**

`app/(main)/billing/page.tsx`:
```tsx
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/Badge";
import { PlanCard } from "@/components/PlanCard";
import { creditTone } from "@/lib/format";
import { checkoutAction, portalAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await requireSession();
  const [summary, txns] = await Promise.all([api.billingSummary(), api.creditTxns()]);
  const canManage = ["owner", "admin"].includes(session.role);
  const tone = creditTone(summary.balance);

  return (
    <section className="space-y-6">
      <PageHeader title="Billing & credits" />

      {/* Balance + current plan */}
      <Card padding="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">Credit balance</div>
            <div className={`text-4xl font-bold ${tone === "danger" ? "text-red-600" : tone === "warn" ? "text-amber-600" : "text-slate-900"}`}>
              {summary.balance.toLocaleString()}
            </div>
            {summary.held > 0 && <div className="mt-1 text-sm text-amber-700">{summary.held} document(s) held, waiting for credits</div>}
          </div>
          <div className="text-right">
            {summary.plan ? (
              <>
                <Badge tone="ok">{summary.plan.key} · {summary.plan.status}</Badge>
                <div className="mt-1 text-xs text-slate-500">Renews {new Date(summary.plan.currentPeriodEnd).toLocaleDateString()}</div>
                {canManage && (
                  <form action={portalAction} className="mt-2">
                    <Button type="submit" variant="secondary" size="sm">Manage subscription</Button>
                  </form>
                )}
              </>
            ) : <Badge tone="muted">No active plan</Badge>}
          </div>
        </div>
      </Card>

      {/* Plan tiers */}
      {canManage && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Object.entries(summary.plans).map(([key, p]) => (
            <PlanCard key={key} planKey={key} monthlyCredits={p.monthlyCredits}
              current={summary.plan?.key === key} action={checkoutAction} />
          ))}
        </div>
      )}

      {/* Transaction history */}
      <Card padding="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Recent credit activity</h2>
        {txns.length === 0 ? (
          <p className="text-sm text-slate-500">No activity yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2">When</th><th className="py-2">Reason</th>
                <th className="py-2 text-right">Change</th><th className="py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="py-2 text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="py-2 text-slate-700">{t.reason}</td>
                  <td className={`py-2 text-right font-medium ${t.amount < 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {t.amount > 0 ? "+" : ""}{t.amount}
                  </td>
                  <td className="py-2 text-right text-slate-700">{t.balanceAfter.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </section>
  );
}
```

- [ ] **Step 3: Verify**

Run (backend running, logged in): open `http://localhost:3000/billing` — balance, plan tiers, and history render. Clicking a plan redirects to Stripe Checkout (test mode).

- [ ] **Step 4: Commit**
```bash
git add "app/(main)/billing"
git commit -m "feat(web): billing page (balance, plans, checkout/portal, history)"
```

---

## Task 5: Credit pill in the nav + low-credit banner

**Files:**
- Create: `components/CreditPill.tsx`, `components/LowCreditBanner.tsx`
- Modify: `components/Nav.tsx`, `app/(main)/layout.tsx`

- [ ] **Step 1: CreditPill (server component — reads the summary)**

`components/CreditPill.tsx`:
```tsx
import Link from "next/link";
import { api } from "@/lib/api";
import { creditTone } from "@/lib/format";

export async function CreditPill() {
  let balance = 0;
  try { balance = (await api.billingSummary()).balance; } catch { return null; }
  const tone = creditTone(balance);
  const cls = tone === "danger" ? "bg-red-100 text-red-800"
    : tone === "warn" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800";
  return (
    <Link href="/billing" className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {balance.toLocaleString()} credits
    </Link>
  );
}
```

- [ ] **Step 2: Add the pill + a Billing/Channels/Settings link to the nav**

In `components/Nav.tsx`, import and render `<CreditPill />` in the nav bar (next to the user/logout area), and add `Billing`, `Channels`, and `Settings` to the link list. Because `CreditPill` is async, ensure `Nav` is an async server component (it already reads the session). Add:
```tsx
import { CreditPill } from "@/components/CreditPill";
```
and render `<CreditPill />` before the logout button; add `["/billing", "Billing"]`, `["/channels", "Channels"]`, `["/settings", "Settings"]` to the nav links array.

- [ ] **Step 3: LowCreditBanner**

`components/LowCreditBanner.tsx`:
```tsx
import Link from "next/link";
import { api } from "@/lib/api";

export async function LowCreditBanner() {
  let summary;
  try { summary = await api.billingSummary(); } catch { return null; }
  if (summary.balance > 100 && summary.held === 0) return null;
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-sm text-amber-800">
      {summary.held > 0
        ? <>⏸ {summary.held} document(s) are <strong>held</strong>, waiting for credits — they’ll process automatically once you top up. </>
        : <>⚠ Low credit balance ({summary.balance}). </>}
      <Link href="/billing" className="font-semibold underline">Add credits</Link>
    </div>
  );
}
```

- [ ] **Step 4: Mount the banner in the main layout**

In `app/(main)/layout.tsx`, render `<LowCreditBanner />` directly under `<Nav />`:
```tsx
import "../globals.css";
import { Nav } from "@/components/Nav";
import { LowCreditBanner } from "@/components/LowCreditBanner";

export const metadata = { title: "Incoming Docs" };

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Nav />
        <LowCreditBanner />
        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Commit**
```bash
git add components/CreditPill.tsx components/LowCreditBanner.tsx components/Nav.tsx "app/(main)/layout.tsx"
git commit -m "feat(web): credit pill in nav + low-credit/held banner"
```

---

## Task 6: Held-for-credits queue page

**Files:**
- Create: `app/(main)/review/held/page.tsx`

- [ ] **Step 1: Page**

`app/(main)/review/held/page.tsx`:
```tsx
import Link from "next/link";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function HeldPage() {
  const docs = await api.listHeld();
  return (
    <section className="space-y-4">
      <PageHeader title="Held for credits" />
      {docs.length === 0 ? (
        <EmptyState>Nothing held — every document is being processed.</EmptyState>
      ) : (
        <Card padding="p-0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Received</th><th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3 text-right">Credit cost</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-500">{new Date(d.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700">{d.source}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{d.credit_cost ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <p className="text-sm text-slate-500">
        These documents are safely stored and will process automatically when you{" "}
        <Link href="/billing" className="font-medium text-indigo-600 underline">add credits</Link>.
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add "app/(main)/review/held"
git commit -m "feat(web): held-for-credits queue page"
```

---

## Task 7: Incoming channels management

**Files:**
- Create: `app/(main)/channels/actions.ts`, `app/(main)/channels/page.tsx`, `app/(main)/channels/ChannelForm.tsx`

- [ ] **Step 1: Actions**

`app/(main)/channels/actions.ts`:
```ts
"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function createChannelAction(formData: FormData) {
  await api.createChannel({
    type: String(formData.get("type")),
    address: String(formData.get("address")),
    label: String(formData.get("label") || "") || undefined,
    webhookSecret: String(formData.get("webhookSecret") || "") || undefined,
  });
  revalidatePath("/channels");
}

export async function toggleChannelAction(id: string, active: boolean) {
  await api.updateChannel(id, { active });
  revalidatePath("/channels");
}

export async function deleteChannelAction(id: string) {
  await api.deleteChannel(id);
  revalidatePath("/channels");
}
```

- [ ] **Step 2: Add-channel form (client island)**

`app/(main)/channels/ChannelForm.tsx`:
```tsx
"use client";
import { useState } from "react";
import { createChannelAction } from "./actions";

const TYPES = ["email", "efax", "sftp", "fhir", "hl7", "secure_msg"];
const COST: Record<string, string> = { email: "1", efax: "3–5/page", sftp: "1", fhir: "1", hl7: "1", secure_msg: "2" };

export function ChannelForm() {
  const [type, setType] = useState("email");
  return (
    <form action={createChannelAction} className="grid grid-cols-1 gap-3 md:grid-cols-5 md:items-end">
      <label className="text-sm">Type
        <select name="type" value={type} onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label className="text-sm md:col-span-2">Incoming address
        <input name="address" required placeholder="clinic@incoming.example.com"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <label className="text-sm">Label
        <input name="label" placeholder="Front desk fax"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Add channel</button>
      <input type="hidden" name="webhookSecret" value="" />
      <p className="text-xs text-slate-500 md:col-span-5">Cost per document on this channel: <strong>{COST[type]}</strong> credit(s).</p>
    </form>
  );
}
```

- [ ] **Step 3: Page**

`app/(main)/channels/page.tsx`:
```tsx
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChannelForm } from "./ChannelForm";
import { toggleChannelAction, deleteChannelAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ChannelsPage() {
  const session = await requireSession();
  const channels = await api.listChannels();
  const canManage = ["owner", "admin"].includes(session.role);
  return (
    <section className="space-y-6">
      <PageHeader title="Incoming channels" />
      <Card padding="p-0">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Type</th><th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Label</th><th className="px-4 py-3">Status</th>
              {canManage && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {channels.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No channels yet.</td></tr>
            )}
            {channels.map((c) => (
              <tr key={c.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{c.type}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{c.address}</td>
                <td className="px-4 py-3 text-slate-600">{c.label ?? "—"}</td>
                <td className="px-4 py-3">{c.active ? <Badge tone="ok">Active</Badge> : <Badge tone="muted">Paused</Badge>}</td>
                {canManage && (
                  <td className="flex gap-2 px-4 py-3">
                    <form action={toggleChannelAction.bind(null, c.id, !c.active)}>
                      <Button type="submit" variant="secondary" size="sm">{c.active ? "Pause" : "Resume"}</Button>
                    </form>
                    <form action={deleteChannelAction.bind(null, c.id)}>
                      <Button type="submit" variant="danger" size="sm">Delete</Button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {canManage && (
        <Card padding="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Add an incoming channel</h2>
          <ChannelForm />
        </Card>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Commit**
```bash
git add "app/(main)/channels"
git commit -m "feat(web): incoming channel management (list/add/pause/delete)"
```

---

## Task 8: Usage on the dashboard

**Files:**
- Modify: `app/(main)/dashboard/page.tsx`

- [ ] **Step 1: Add a credits/usage row**

In `app/(main)/dashboard/page.tsx`, fetch the billing summary alongside metrics and add credit stats. Add near the top of the component body:
```tsx
import { Stat } from "@/components/Stat";
// ...
const [m, billing] = await Promise.all([api.metrics(), api.billingSummary()]);
```
Then add a stats block under the existing metrics grid:
```tsx
      <h2 className="mt-8 mb-4 text-lg font-semibold">Credits</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Balance" value={billing.balance.toLocaleString()} hint={billing.plan ? `${billing.plan.key} plan` : "no plan"} />
        <Stat label="Held for credits" value={billing.held} hint="auto-process on top-up" />
        <Stat label="Monthly allotment" value={billing.plan ? billing.plan.monthlyCredits.toLocaleString() : "—"} />
        <Stat label="Rollover cap" value={billing.plan ? billing.plan.rolloverCap.toLocaleString() : "—"} />
      </div>
```
(Keep the existing metrics grid and imports; only add the billing fetch and the new block.)

- [ ] **Step 2: Commit**
```bash
git add "app/(main)/dashboard/page.tsx"
git commit -m "feat(web): credits & usage on the dashboard"
```

---

## Task 9: Account settings — change password

**Files:**
- Create: `app/(main)/settings/actions.ts`, `app/(main)/settings/page.tsx`

- [ ] **Step 1: Action**

`app/(main)/settings/actions.ts`:
```ts
"use server";
import { api } from "@/lib/api";

export async function changePasswordAction(_prev: { error?: string; ok?: boolean }, formData: FormData) {
  const current = String(formData.get("currentPassword"));
  const next = String(formData.get("newPassword"));
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  try {
    await api.changePassword(current, next);
    return { ok: true };
  } catch {
    return { error: "Current password is incorrect." };
  }
}
```

- [ ] **Step 2: Page (client form with useActionState for feedback)**

`app/(main)/settings/page.tsx`:
```tsx
"use client";
import { useActionState } from "react";
import { changePasswordAction } from "./actions";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
  const [state, action, pending] = useActionState(changePasswordAction, {});
  return (
    <section className="max-w-md space-y-6">
      <PageHeader title="Account settings" />
      <Card padding="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Change password</h2>
        <form action={action} className="space-y-3">
          <FormField label="Current password">
            <input name="currentPassword" type="password" required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </FormField>
          <FormField label="New password">
            <input name="newPassword" type="password" required minLength={8}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </FormField>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state.ok && <p className="text-sm text-emerald-600">Password updated. Other sessions were signed out.</p>}
          <Button type="submit" variant="primary" disabled={pending}>{pending ? "Saving…" : "Update password"}</Button>
        </form>
      </Card>
    </section>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add "app/(main)/settings"
git commit -m "feat(web): account settings — change password"
```

---

## Task 10: End-to-end happy path + README

**Files:**
- Create: `e2e/billing.spec.ts`; Modify: `README.md`

- [ ] **Step 1: Playwright spec**

`e2e/billing.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

// Prereq: backend + worker running, a user logged in (storageState or login step),
// and the test account has at least a starter grant. This checks the billing surface renders
// and the plan tiers + balance are visible. (Checkout itself redirects to Stripe — not asserted here.)
test("billing page shows balance and plan tiers", async ({ page }) => {
  await page.goto("/billing");
  await expect(page.getByRole("heading", { name: /billing & credits/i })).toBeVisible();
  await expect(page.getByText(/credit balance/i)).toBeVisible();
  await expect(page.getByText(/starter/i)).toBeVisible();
  await expect(page.getByText(/growth/i)).toBeVisible();
  await expect(page.getByText(/scale/i)).toBeVisible();
});
```
> Logging in within Playwright: reuse the project's existing auth setup (the migration added auth pages). If there's no stored auth state yet, add a `beforeEach` that signs up/logs in via the UI, mirroring `e2e/flow.spec.ts`.

- [ ] **Step 2: Run component tests**

Run: `npm test`
Expected: all Vitest suites green (including `creditTone`, `planCard`).

- [ ] **Step 3: README**

Update `README.md`: the new pages (`/billing`, `/channels`, `/review/held`, `/settings`), that Stripe Checkout/Portal are hosted redirects (no card data in this app, no publishable key needed), the credit pill + low-credit/held banner, and that all billing/credit data comes from the backend over the server-only client (no secrets in the browser).

- [ ] **Step 4: Commit**
```bash
git add e2e/billing.spec.ts README.md
git commit -m "test+docs(web): billing e2e + README for credits/channels/settings"
```

---

## Self-Review

**Coverage (against the requested scope):**
- Subscriptions/credits UI: balance, plan tiers, checkout, portal, history → Task 4; pill + banner → Task 5; dashboard usage → Task 8.
- Out-of-credits visibility (never-drop): held queue → Task 6; banner + summary `held` count → Tasks 4/5.
- Channels (backend CRUD existed, no UI) → Task 7, with per-channel credit cost surfaced.
- Account settings (change password) → Task 9.
- Testing pyramid: pure helper (`creditTone`, Task 2) + pure component (`PlanCard`, Task 3) unit-tested; flow via Playwright (Task 10) — same split the existing app uses.

**Type consistency:** `BillingSummary`, `CreditTxn`, `Channel`, `HeldDoc` (Task 1) are parsed by the client and consumed unchanged by the billing page (4), pill/banner (5), held page (6), channels page (7), and dashboard (8). `PlanCard` props (`planKey`, `monthlyCredits`, `current`, `action`) match its call site in Task 4. Server actions `checkoutAction`/`portalAction` (Task 4), `createChannelAction`/`toggleChannelAction`/`deleteChannelAction` (Task 7), and `changePasswordAction` (Task 9) match their bound call sites.

**Security:** no Stripe publishable key or card data in this app — Checkout/Portal are hosted, reached by redirecting to a backend-issued URL; the JWT stays in the httpOnly cookie and the backend API key is never exposed (unchanged from the migrated app).

**Placeholder scan:** every page, action, and component has complete code. The one place that depends on existing project specifics (Playwright login, nav link insertion) is called out explicitly with what to mirror, not hand-waved.

**Deferred (excluded by request):** PMS, email verification, production/ops. **Deferred (noted):** audit-trail viewer (needs a backend audit endpoint, out of scope), live refresh/websockets, image zoom & multi-page PDF rendering, dark mode/i18n.
