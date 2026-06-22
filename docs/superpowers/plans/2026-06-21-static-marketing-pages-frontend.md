# Static & Marketing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public-facing site for inbound-docs — a marketing landing, pricing, security/compliance, about, and contact pages, plus finished legal pages (privacy/terms/sub-processors) — under a shared, branded public layout, and free up `/` for the landing by moving the authenticated app to `/inbox`.

**Architecture:** A new `(marketing)` App Router group owns all public routes with its own root layout (header + footer). The authenticated app stays in `(main)` but its inbox moves from `/` to `/inbox`. `middleware.ts` is updated so marketing routes are public and logged-in visitors hitting `/` are redirected into the app. Pages are server components using a small set of marketing UI primitives; existing `components/ui/*` (Button, Card) are reused.

**Tech Stack:** Next.js App Router (server components), Tailwind v4, vitest + @testing-library/react for smoke tests. Brand: indigo accent on slate (matches the existing app).

**Decisions (confirmed):** full marketing + legal; landing at `/`; real draft copy. Legal copy is a starting draft — **must be reviewed by an Australian privacy lawyer before go-live** (per the compliance doc).

---

## Page inventory

| Route | Group | Status today | This plan |
|-------|-------|--------------|-----------|
| `/` | (marketing) | app inbox | **New** landing page |
| `/inbox` | (main) | — | inbox **moved** here from `/` |
| `/pricing` | (marketing) | — | **New** |
| `/security` | (marketing) | — | **New** (Security & Compliance) |
| `/about` | (marketing) | — | **New** |
| `/contact` | (marketing) | — | **New** (+ lead capture) |
| `/integrations` | (marketing) | exists (dynamic) | move under layout |
| `/privacy` | (marketing) | structured | move under layout |
| `/terms` | (marketing) | placeholder | **rewrite** |
| `/sub-processors` | (marketing) | exists | move under layout |
| `not-found` | root | missing | **New** 404 |

## File structure

```
app/
  (marketing)/
    layout.tsx            # html/body + MarketingHeader + MarketingFooter
    page.tsx              # landing
    pricing/page.tsx
    security/page.tsx
    about/page.tsx
    contact/page.tsx
    contact/actions.ts    # lead capture server action
    integrations/page.tsx # moved
    privacy/page.tsx      # moved
    terms/page.tsx        # moved + rewritten
    sub-processors/page.tsx # moved
  (main)/
    inbox/page.tsx        # moved from (main)/page.tsx
  not-found.tsx
components/
  marketing/
    MarketingHeader.tsx
    MarketingFooter.tsx
    Section.tsx
    Hero.tsx
    FeatureCard.tsx
    CTA.tsx
```

---

## Task 1: Marketing layout, header, footer, primitives

**Files:**
- Create: `app/(marketing)/layout.tsx`
- Create: `components/marketing/MarketingHeader.tsx`, `MarketingFooter.tsx`, `Section.tsx`, `CTA.tsx`
- Test: `tests/marketing-layout.test.tsx`

- [ ] **Step 1: Section + CTA primitives**

```tsx
// components/marketing/Section.tsx
export function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`mx-auto w-full max-w-6xl px-6 py-16 ${className}`}>{children}</section>;
}
```

```tsx
// components/marketing/CTA.tsx
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
```

- [ ] **Step 2: Header**

```tsx
// components/marketing/MarketingHeader.tsx
import Link from "next/link";
import { CTA } from "./CTA";

const nav = [
  ["/pricing", "Pricing"],
  ["/integrations", "Integrations"],
  ["/security", "Security"],
  ["/about", "About"],
  ["/contact", "Contact"],
];

export function MarketingHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold text-indigo-600">Inbound Docs</Link>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map(([href, label]) => (
            <Link key={href} href={href} className="text-sm font-medium text-slate-600 hover:text-slate-900">{label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Log in</Link>
          <CTA href="/signup">Start free</CTA>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Footer**

```tsx
// components/marketing/MarketingFooter.tsx
import Link from "next/link";

const cols: [string, [string, string][]][] = [
  ["Product", [["/pricing", "Pricing"], ["/integrations", "Integrations"], ["/security", "Security"]]],
  ["Company", [["/about", "About"], ["/contact", "Contact"]]],
  ["Legal", [["/privacy", "Privacy"], ["/terms", "Terms"], ["/sub-processors", "Sub-processors"]]],
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="text-base font-semibold text-indigo-600">Inbound Docs</div>
          <p className="mt-2 text-sm text-slate-500">Clinical document triage and filing for Australian practices.</p>
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <ul className="mt-3 space-y-2">
              {links.map(([href, label]) => (
                <li key={href}><Link href={href} className="text-sm text-slate-600 hover:text-slate-900">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 px-6 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Inbound Docs. Hosted in Australia.
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Layout (provides html/body for the group)**

```tsx
// app/(marketing)/layout.tsx
import "../globals.css";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const metadata = {
  title: "Inbound Docs — clinical document triage for Australian practices",
  description: "Automatically triage, match and file inbound clinical documents. Onshore, encrypted, human-in-the-loop.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">
        <MarketingHeader />
        <main>{children}</main>
        <MarketingFooter />
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Smoke test**

```tsx
// tests/marketing-layout.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

describe("MarketingFooter", () => {
  it("links to legal pages", () => {
    render(<MarketingFooter />);
    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("Sub-processors")).toBeInTheDocument();
  });
});
```

Run: `npx vitest run tests/marketing-layout.test.tsx` → PASS.

- [ ] **Step 6: Commit** — `git add app/(marketing)/layout.tsx components/marketing tests/marketing-layout.test.tsx && git commit -m "feat(marketing): public layout, header, footer, primitives"`

---

## Task 2: Move the authenticated inbox to /inbox

**Files:**
- Move: `app/(main)/page.tsx` → `app/(main)/inbox/page.tsx`
- Modify: `middleware.ts`, `components/NavLinks.tsx`

- [ ] **Step 1: Move the file**

```bash
git mv "app/(main)/page.tsx" "app/(main)/inbox/page.tsx"
```

No code change needed inside the page; its route is now `/inbox`.

- [ ] **Step 2: Update the Review menu link**

In `components/NavLinks.tsx`, change the Inbox item and active prefixes:

```tsx
<NavMenu label="Review" activePrefixes={["/inbox", "/review"]}>
  <NavMenuItem href="/inbox" label="Inbox" />
  <NavMenuItem href="/review/failed" label="Failed" />
  <NavMenuItem href="/review/held" label="Held" />
</NavMenu>
```

- [ ] **Step 3: Update middleware — public marketing routes + root redirect**

Replace the `PUBLIC` list and add a root-redirect branch in `middleware.ts`:

```ts
const PUBLIC = [
  "/", "/pricing", "/security", "/about", "/contact", "/integrations",
  "/privacy", "/terms", "/sub-processors",
  "/login", "/signup", "/forgot-password", "/reset-password", "/invitations",
  "/verify-email", "/goodbye", "/mfa-enroll",
];
```

In `middleware()`, before the existing public check, redirect authenticated users away from the landing:

```ts
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const access = req.cookies.get("auth_access")?.value;

  // Logged-in users hitting the marketing landing go straight to the app.
  if (pathname === "/" && access && !isExpired(access)) {
    return NextResponse.redirect(new URL("/inbox", req.url));
  }
  if (PUBLIC.some((p) => (p === "/" ? pathname === "/" : pathname.startsWith(p)))) {
    return NextResponse.next();
  }
  // ...existing auth/refresh logic unchanged...
}
```

> Keep the existing refresh-token logic below this block. Note the matcher already excludes `_next` assets.

- [ ] **Step 4: Verify build + existing tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASS. (Update any test that navigates to `/` expecting the inbox to use `/inbox`.)

- [ ] **Step 5: Commit** — `git commit -am "refactor(app): move inbox to /inbox; free / for the marketing landing"`

---

## Task 3: Move existing public pages into (marketing) + 404

**Files:**
- Move: `app/privacy`, `app/terms`, `app/sub-processors`, `app/integrations` → under `app/(marketing)/`
- Create: `app/not-found.tsx`

- [ ] **Step 1: Move the four existing public pages**

```bash
git mv app/privacy "app/(marketing)/privacy"
git mv app/terms "app/(marketing)/terms"
git mv app/sub-processors "app/(marketing)/sub-processors"
git mv app/integrations "app/(marketing)/integrations"
```

Their URLs are unchanged (route groups don't affect the path); they now inherit the marketing header/footer. Fix any relative imports that break (e.g. `../../lib/api` → `@/lib/api`).

- [ ] **Step 2: Global 404**

```tsx
// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-white text-center text-slate-900">
        <p className="text-sm font-semibold text-indigo-600">404</p>
        <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you’re looking for doesn’t exist.</p>
        <Link href="/" className="mt-6 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          Back to home
        </Link>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify** — `npx tsc --noEmit && npx vitest run` → PASS; manually confirm `/privacy`, `/integrations` still load with the new header/footer.

- [ ] **Step 4: Commit** — `git commit -am "feat(marketing): move public pages under marketing layout; add 404"`

---

## Task 4: Landing page (/)

**Files:**
- Create: `app/(marketing)/page.tsx`
- Create: `components/marketing/Hero.tsx`, `FeatureCard.tsx`

- [ ] **Step 1: Hero + FeatureCard**

```tsx
// components/marketing/Hero.tsx
import { CTA } from "./CTA";
export function Hero() {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Inbound clinical documents, triaged and filed — automatically.
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
```

```tsx
// components/marketing/FeatureCard.tsx
export function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </div>
  );
}
```

- [ ] **Step 2: Landing page composition**

```tsx
// app/(marketing)/page.tsx
import { Hero } from "@/components/marketing/Hero";
import { Section } from "@/components/marketing/Section";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { CTA } from "@/components/marketing/CTA";

const steps = [
  ["1 · Receive", "Documents arrive by fax, email, secure messaging, HL7 or FHIR — into one inbox."],
  ["2 · Understand", "AI extracts the patient, document type and urgency, and matches your roster."],
  ["3 · Confirm & file", "Your team confirms in seconds; the document is filed into your PMS with the loop closed."],
];

const features = [
  ["Patient & provider matching", "Fuzzy + phonetic matching against your roster so documents reach the right chart."],
  ["Urgent detection", "Clinically urgent results are flagged and escalated so nothing slips."],
  ["Works with your PMS", "Write-back to supported practice software, or export mode for everyone else."],
  ["Onshore & encrypted", "All health data stored in Australia, encrypted in transit and at rest."],
  ["Full audit trail", "Every access and state change is logged for access/correction requests."],
  ["Human-in-the-loop", "Staff confirm every document — no decision is made solely by a computer."],
];

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Section>
        <h2 className="text-center text-2xl font-bold text-slate-900">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(([t, b]) => <FeatureCard key={t} title={t} body={b} />)}
        </div>
      </Section>
      <Section className="bg-slate-50">
        <h2 className="text-center text-2xl font-bold text-slate-900">Built for clinical document workflows</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map(([t, b]) => <FeatureCard key={t} title={t} body={b} />)}
        </div>
      </Section>
      <Section className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Ready to clear the document backlog?</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">Start free, no credit card. Bring your first channel online in minutes.</p>
        <div className="mt-6 flex justify-center gap-3">
          <CTA href="/signup">Start free</CTA>
          <CTA href="/pricing" variant="secondary">See pricing</CTA>
        </div>
      </Section>
    </>
  );
}
```

- [ ] **Step 3: Smoke test** — render `LandingPage`, assert the hero headline + a "Start free" link exist. Run vitest → PASS.

- [ ] **Step 4: Commit** — `git commit -am "feat(marketing): landing page"`

---

## Task 5: Pricing page (/pricing)

**Files:** Create `app/(marketing)/pricing/page.tsx`

Tiers mirror the Stripe products (Starter / Growth / Scale). **Amounts are placeholders — owner sets real prices.**

- [ ] **Step 1: Page**

```tsx
// app/(marketing)/pricing/page.tsx
import { Section } from "@/components/marketing/Section";
import { CTA } from "@/components/marketing/CTA";

const tiers = [
  { name: "Starter", price: "A$—/mo", blurb: "Single-site practices getting started.",
    features: ["1 inbound channel", "Up to N documents/mo", "PMS export mode", "Email support"] },
  { name: "Growth", price: "A$—/mo", featured: true, blurb: "Busy practices that want write-back.",
    features: ["Multiple channels", "Higher document volume", "PMS write-back", "Urgent escalation", "Priority support"] },
  { name: "Scale", price: "Contact us", blurb: "Groups, PHNs and hospital workflows.",
    features: ["Unlimited channels", "Volume pricing", "SSO", "SLA & onboarding", "Dedicated support"] },
];

export default function PricingPage() {
  return (
    <Section>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Simple, usage-based pricing</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">Start free with trial credits. Pay for what you process.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.name} className={`rounded-xl border p-6 ${t.featured ? "border-indigo-600 shadow-lg" : "border-slate-200"}`}>
            {t.featured && <div className="mb-2 inline-block rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Most popular</div>}
            <h3 className="text-lg font-semibold text-slate-900">{t.name}</h3>
            <div className="mt-2 text-2xl font-bold text-slate-900">{t.price}</div>
            <p className="mt-2 text-sm text-slate-600">{t.blurb}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {t.features.map((f) => <li key={f} className="flex gap-2"><span className="text-indigo-600">✓</span>{f}</li>)}
            </ul>
            <div className="mt-6"><CTA href={t.name === "Scale" ? "/contact" : "/signup"} variant={t.featured ? "primary" : "secondary"}>
              {t.name === "Scale" ? "Contact sales" : "Start free"}
            </CTA></div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-16 max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900">Pricing FAQ</h2>
        <dl className="mt-6 space-y-4">
          {[
            ["Is there a free trial?", "Yes — verified accounts get trial credits to process documents before paying."],
            ["How is usage measured?", "Per document processed; fax pages may use additional credits. See your billing dashboard."],
            ["Can I change plans?", "Yes, upgrade or downgrade anytime from the billing page."],
          ].map(([q, a]) => (
            <div key={q}><dt className="font-medium text-slate-900">{q}</dt><dd className="mt-1 text-sm text-slate-600">{a}</dd></div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Commit** — `git commit -am "feat(marketing): pricing page"`

---

## Task 6: Security & Compliance page (/security)

**Files:** Create `app/(marketing)/security/page.tsx`. This is the page clinic/PHN buyers will scrutinise — it mirrors the controls actually implemented.

- [ ] **Step 1: Page**

```tsx
// app/(marketing)/security/page.tsx
import { Section } from "@/components/marketing/Section";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import Link from "next/link";

const controls = [
  ["Onshore data residency", "All health data — database, document storage and backups — is hosted in Australia (Sydney)."],
  ["Encryption everywhere", "TLS in transit and AES-256 / KMS encryption at rest for the database, object storage and backups."],
  ["Access control & isolation", "Role-based access, least privilege and strict per-practice (tenant) data isolation."],
  ["Multi-factor authentication", "MFA available for all accounts and enforced for privileged roles."],
  ["Audit logging", "Every document access and state change is logged to support access and correction requests."],
  ["Data minimisation", "Raw documents are purged after filing and identifiers de-identified when no longer needed."],
];

export default function SecurityPage() {
  return (
    <Section>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Security &amp; compliance</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          We handle health information under the Privacy Act 1988 and the Australian Privacy Principles (APPs),
          and align our controls to the ACSC Essential Eight.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {controls.map(([t, b]) => <FeatureCard key={t} title={t} body={b} />)}
      </div>
      <div className="mx-auto mt-12 max-w-2xl rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        <p><strong>AI processing.</strong> We use AI to extract document fields; output is always reviewed and confirmed
        by a person before filing. We do not use patient data to train models. See our{" "}
        <Link href="/sub-processors" className="text-indigo-600 underline">sub-processors</Link> and{" "}
        <Link href="/privacy" className="text-indigo-600 underline">privacy policy</Link>.</p>
        <p className="mt-3"><strong>Breach response.</strong> We operate a Notifiable Data Breaches process and will notify the
        OAIC and affected individuals where required.</p>
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Commit** — `git commit -am "feat(marketing): security & compliance page"`

---

## Task 7: About page (/about)

**Files:** Create `app/(marketing)/about/page.tsx`

- [ ] **Step 1: Page**

```tsx
// app/(marketing)/about/page.tsx
import { Section } from "@/components/marketing/Section";
import { CTA } from "@/components/marketing/CTA";

export default function AboutPage() {
  return (
    <Section className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">About Inbound Docs</h1>
      <div className="prose prose-slate mt-6">
        <p>Australian medical practices receive a relentless stream of inbound documents — pathology and
        radiology results, specialist letters, discharge summaries, referrals — across fax, email and secure
        messaging. Sorting, matching and filing them by hand is slow, error-prone, and a patient-safety risk
        when urgent results are missed.</p>
        <p>Inbound Docs triages that stream automatically and files it into your practice software, with a
        person confirming every document. We built it onshore, privacy-first, and for the realities of
        Australian clinical workflows.</p>
        <h2>Our principles</h2>
        <ul>
          <li><strong>Patient safety first</strong> — urgent results are surfaced, never buried.</li>
          <li><strong>Human-in-the-loop</strong> — AI assists; your team decides.</li>
          <li><strong>Privacy by design</strong> — onshore, encrypted, minimised.</li>
        </ul>
      </div>
      <div className="mt-8"><CTA href="/contact">Talk to us</CTA></div>
    </Section>
  );
}
```

- [ ] **Step 2: Commit** — `git commit -am "feat(marketing): about page"`

---

## Task 8: Contact / Book a demo (/contact) + lead capture

**Files:**
- Create: `app/(marketing)/contact/page.tsx`, `app/(marketing)/contact/ContactForm.tsx`, `app/(marketing)/contact/actions.ts`
- Reuse pattern: the existing PMS-request lead flow (`app/integrations/request/actions.ts`).

- [ ] **Step 1: Server action (lead capture)**

```ts
// app/(marketing)/contact/actions.ts
"use server";

const BASE = process.env.BACKEND_URL!;

export async function submitContact(_prev: unknown, formData: FormData) {
  const payload = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    practice: String(formData.get("practice") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  if (!payload.email || !payload.name) return { ok: false, error: "Name and email are required." };
  try {
    // Reuse a leads endpoint if available; otherwise wire to your CRM/email.
    const r = await fetch(`${BASE}/leads/contact`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    if (!r.ok) return { ok: false, error: "Something went wrong — email us at hello@yourdomain." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong — email us at hello@yourdomain." };
  }
}
```

> Backend note: add a public `POST /leads/contact` endpoint (rate-limited, no auth) that stores the lead or forwards it to email/CRM. If you don't want a backend dependency yet, swap the action body for a `mailto:`-style fallback or a third-party form service.

- [ ] **Step 2: Form (client) + page**

```tsx
// app/(marketing)/contact/ContactForm.tsx
"use client";
import { useActionState } from "react";
import { submitContact } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, null as null | { ok: boolean; error?: string });
  if (state?.ok) return <p className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-700">Thanks — we’ll be in touch shortly.</p>;
  return (
    <form action={action} className="space-y-4">
      <input name="name" placeholder="Your name" className="w-full rounded-md border border-slate-300 px-3 py-2" />
      <input name="email" type="email" placeholder="Work email" className="w-full rounded-md border border-slate-300 px-3 py-2" />
      <input name="practice" placeholder="Practice / organisation" className="w-full rounded-md border border-slate-300 px-3 py-2" />
      <textarea name="message" placeholder="How can we help?" rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2" />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
```

```tsx
// app/(marketing)/contact/page.tsx
import { Section } from "@/components/marketing/Section";
import { ContactForm } from "./ContactForm";

export default function ContactPage() {
  return (
    <Section className="max-w-xl">
      <h1 className="text-3xl font-bold text-slate-900">Book a demo</h1>
      <p className="mt-3 text-slate-600">Tell us about your practice and we’ll show you Inbound Docs on your workflow.</p>
      <div className="mt-8"><ContactForm /></div>
    </Section>
  );
}
```

- [ ] **Step 3: Add /contact to the middleware PUBLIC list** (already added in Task 2).

- [ ] **Step 4: Smoke test** — render `ContactForm`, assert the email field + submit button render. Run vitest → PASS.

- [ ] **Step 5: Commit** — `git commit -am "feat(marketing): contact / book-a-demo page with lead capture"`

---

## Task 9: Rewrite Terms of Service (/terms)

**Files:** Modify `app/(marketing)/terms/page.tsx` (replace the placeholder).

- [ ] **Step 1: Structured draft (lawyer review required before live)**

```tsx
// app/(marketing)/terms/page.tsx
export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 prose prose-slate">
      <h1>Terms of Service</h1>
      <p className="text-sm text-slate-500">Last updated: 21 June 2026. <em>Owner: have these reviewed by an Australian lawyer before go-live.</em></p>

      <h2>1. Agreement</h2>
      <p>These terms govern your use of the Inbound Docs service operated by [legal entity, ABN]. By creating an account you accept these terms and our <a href="/privacy">Privacy Policy</a>.</p>

      <h2>2. The service</h2>
      <p>Inbound Docs ingests, triages, matches and files clinical documents on behalf of your practice. AI-assisted output is reviewed and confirmed by your staff before filing. The service does not provide medical advice.</p>

      <h2>3. Your responsibilities</h2>
      <p>You are responsible for obtaining patient consent as required, for the accuracy of your roster, for reviewing documents before filing, and for maintaining the security of your account credentials and MFA.</p>

      <h2>4. Data &amp; privacy</h2>
      <p>We act as a processor handling health information under your authority. Our handling is described in the <a href="/privacy">Privacy Policy</a> and any Data Processing Agreement signed with your practice. Sub-processors are listed at <a href="/sub-processors">/sub-processors</a>.</p>

      <h2>5. Fees</h2>
      <p>Paid plans are billed per the pricing in effect. Usage (documents processed, fax pages) may consume credits. Fees are non-refundable except as required by law.</p>

      <h2>6. Availability</h2>
      <p>We aim for high availability but do not guarantee uninterrupted service except where a separate SLA applies.</p>

      <h2>7. Acceptable use</h2>
      <p>You must not misuse the service, attempt to breach its security, or upload content you are not authorised to process.</p>

      <h2>8. Liability</h2>
      <p>To the extent permitted by law, our liability is limited as set out in your plan or agreement. Nothing limits rights that cannot be excluded under the Australian Consumer Law.</p>

      <h2>9. Termination</h2>
      <p>Either party may terminate per the plan terms. On termination we return or delete your data as described in the DPA / Privacy Policy.</p>

      <h2>10. Changes &amp; contact</h2>
      <p>We may update these terms; material changes will be notified. Questions: [legal@yourdomain].</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit** — `git commit -am "feat(legal): structured Terms of Service draft"`

---

## Task 10: Final wiring & verification

- [ ] **Step 1:** Confirm every header/footer link resolves (`/`, `/pricing`, `/integrations`, `/security`, `/about`, `/contact`, `/privacy`, `/terms`, `/sub-processors`, `/login`, `/signup`).
- [ ] **Step 2:** Confirm logged-out `/` shows the landing; logged-in `/` redirects to `/inbox`; the app's Review → Inbox points to `/inbox`.
- [ ] **Step 3:** `npx tsc --noEmit && npx vitest run && npm run build` → all green.
- [ ] **Step 4:** Set page `metadata` (title/description) per page for SEO (landing, pricing, security at minimum).
- [ ] **Step 5:** Commit any fixups.

## Self-review checklist
- **Routing:** only one `/` page (marketing); inbox moved to `/inbox`; middleware allows all marketing routes and redirects authed `/`.
- **Layout:** every public page renders inside `(marketing)/layout.tsx` (header + footer); no page is left as a bare `app/*` route without a layout.
- **Legal:** privacy (done), terms (rewritten), sub-processors (done) all reachable from the footer; each legal page flags lawyer review.
- **No placeholders** in code; marketing copy is real draft; pricing amounts and entity/ABN/contact details are the only intentional fill-ins (clearly marked).
- **Backend dependency:** `/contact` needs a public `POST /leads/contact` (or a form-service fallback) — called out in Task 8.

---

## Execution

Plan saved. Two options:
1. **Subagent-driven (recommended)** — one subagent per task, review between.
2. **Inline** — execute here with checkpoints.
