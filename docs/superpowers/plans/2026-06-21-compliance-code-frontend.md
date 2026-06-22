# Healthcare Compliance — Frontend Code Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the *code-level* compliance gaps in the Next.js web app against the Australian Healthcare Data Compliance Guidelines — secure session cookies, a real privacy policy (with AI-use + overseas-disclosure statements), an AI-use disclosure in the UI, MFA enrollment enforcement UX, and a public sub-processor list. Legal *wording* is the org owner's to finalise; this plan ships the structure and required disclosure sections.

**Architecture:** App Router (server components + server actions). Cookies are set in `lib/auth.ts` (shared helper) and `middleware.ts`. Tests use vitest (`vitest.config.ts`). We add `secure` to the shared cookie options, replace the placeholder privacy page with a structured one, add a disclosure banner component, and pair the backend MFA-enrollment response (companion backend plan, Task 4) with a forced-enrollment flow.

**Tech Stack:** Next.js (App Router), React server components, server actions, vitest, Tailwind.

**Pairs with:** `inbound-docs-api/docs/superpowers/plans/2026-06-21-compliance-code-backend.md` (Task 4 MFA enrollment; Task 2 sub-processor register).

**Compliance mapping (doc §):**
- Task 1 → §6 Encryption in transit (secure cookies), checklist #2
- Task 2 → §2 APP 1 + §5 AI transparency + §4 overseas disclosure, checklist #8
- Task 3 → §5 AI-use disclosure in product
- Task 4 → §6 MFA, checklist #3
- Task 5 → §7 sub-processor register

---

## File Structure

| File | Responsibility | Tasks |
|------|----------------|-------|
| `lib/auth.ts` | `secure` flag on session cookies | 1 |
| `middleware.ts` | `secure` flag on refreshed cookies | 1 |
| `app/(admin)/admin/tenants/actions.ts` | `secure` on impersonating cookie | 1 |
| `app/privacy/page.tsx` | Structured privacy policy + AI-use + overseas statements | 2 |
| `components/AiUseNotice.tsx` (new) | Reusable AI-processing disclosure | 3 |
| `app/(main)/upload/page.tsx`, `app/(main)/review/[id]/page.tsx` | Render the notice | 3 |
| `app/(auth)/login/MfaChallenge.tsx` + `app/(auth)/mfa-enroll/*` (new) | Forced MFA enrollment flow | 4 |
| `app/(auth)/login/actions.ts` | Handle `mfa_enrollment_required` | 4 |
| `app/sub-processors/page.tsx` (new) | Public sub-processor list | 5 |

---

## Task 1: Secure flag on all session cookies

**Files:**
- Modify: `lib/auth.ts:29-34`
- Modify: `middleware.ts:30-34`
- Modify: `app/(admin)/admin/tenants/actions.ts:19`
- Test: `tests/auth-cookies.test.ts` (create)

Auth cookies are set with `httpOnly` + `sameSite: "lax"` but **no `secure` flag**, so they can be sent over plain HTTP. Add `secure` in production (doc §6 — encryption in transit).

- [ ] **Step 1: Write the failing test**

```typescript
// tests/auth-cookies.test.ts
import { describe, it, expect } from 'vitest';
import { cookieOptions } from '../lib/auth';

describe('cookieOptions', () => {
  it('is secure in production', () => {
    expect(cookieOptions('production').secure).toBe(true);
    expect(cookieOptions('production').httpOnly).toBe(true);
    expect(cookieOptions('production').sameSite).toBe('lax');
  });
  it('is not secure in development (so localhost http works)', () => {
    expect(cookieOptions('development').secure).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/auth-cookies.test.ts`
Expected: FAIL — `cookieOptions` is not exported.

- [ ] **Step 3: Export shared cookie options from `lib/auth.ts`**

Replace lines 29-34 of `lib/auth.ts`:

```typescript
export function cookieOptions(env: string | undefined = process.env.NODE_ENV) {
  return { httpOnly: true, sameSite: "lax" as const, path: "/", secure: env === "production" };
}

export async function setAuthCookies(access: string, refresh: string) {
  const store = await cookies();
  const opts = cookieOptions();
  store.set("auth_access", access, opts);
  store.set("auth_refresh", refresh, opts);
}
```

- [ ] **Step 4: Use it in `middleware.ts`**

In `middleware.ts`, replace the inline `opts`:

```typescript
import { cookieOptions } from "./lib/auth";
// ...
        const next = NextResponse.next();
        const opts = cookieOptions();
        next.cookies.set("auth_access", data.access, opts);
        next.cookies.set("auth_refresh", data.refresh, opts);
        return next;
```

> `lib/auth.ts` imports `server-only`; `middleware.ts` runs in the edge runtime. If importing it triggers a `server-only` error, inline the same object literal in `middleware.ts` instead: `{ httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" }`.

- [ ] **Step 5: Fix the impersonation cookie**

In `app/(admin)/admin/tenants/actions.ts:19`, add `secure`:

```typescript
  store.set("impersonating", "1", { httpOnly: false, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" });
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/auth-cookies.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/auth.ts middleware.ts "app/(admin)/admin/tenants/actions.ts" tests/auth-cookies.test.ts
git commit -m "fix(security): set secure flag on session cookies in production"
```

---

## Task 2: Structured privacy policy with AI-use + overseas-disclosure statements

**Files:**
- Modify: `app/privacy/page.tsx`
- Test: `tests/privacy-page.test.tsx` (create)

The privacy page is a literal "Placeholder" string. Doc §2 (APP 1), §4, and §5 require a published policy that includes an **AI-use statement** and an **overseas-disclosure statement**. Ship a structured policy with all required sections; mark the prose owner-editable.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/privacy-page.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrivacyPage from '../app/privacy/page';

describe('Privacy policy', () => {
  it('includes the required compliance sections', () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/use of artificial intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/overseas disclosure/i)).toBeInTheDocument();
    expect(screen.getByText(/notifiable data breach/i)).toBeInTheDocument();
    expect(screen.getByText(/access and correction/i)).toBeInTheDocument();
  });
});
```

> If RTL isn't installed: `npm install -D @testing-library/react @testing-library/jest-dom`, and ensure `vitest.config.ts` uses `environment: 'jsdom'`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/privacy-page.test.tsx`
Expected: FAIL — sections absent.

- [ ] **Step 3: Replace the privacy page**

```tsx
// app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl p-8 prose prose-slate">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-slate-500">
        Last updated: 21 June 2026. This policy describes how we handle personal and health information
        under the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).
        <em> Owner: replace the bracketed details with your registered entity information before going live.</em>
      </p>

      <h2>1. Who we are</h2>
      <p>[Legal entity name, ABN, contact]. We provide a service that ingests, processes and files
        clinical documents on behalf of medical practices. Privacy enquiries: [privacy@yourdomain].</p>

      <h2>2. Information we handle</h2>
      <p>We process health information (a category of sensitive information) contained in clinical
        documents — patient identifiers, document type, clinical findings — strictly on behalf of, and
        under the authority of, the medical practice that engages us.</p>

      <h2>3. How we use it</h2>
      <p>We use documents only to triage, match and file them for the practice that sent them. We do not
        reuse patient data to train AI models or for any other practice.</p>

      <h2>4. Use of artificial intelligence</h2>
      <p>We use an AI service to extract fields from documents. AI-assisted output is always reviewed and
        confirmed by a person before filing (human-in-the-loop) — no decision that significantly affects an
        individual is made solely by a computer. See our <a href="/sub-processors">sub-processor list</a>.</p>

      <h2>5. Overseas disclosure</h2>
      <p>Some processing occurs outside Australia: our AI extraction provider and certain communication
        providers operate overseas. We take reasonable steps, including contractual safeguards, to ensure
        these recipients handle information consistently with the APPs, and we remain accountable for it.
        Health data at rest is stored onshore in Australia (Sydney).</p>

      <h2>6. Security</h2>
      <p>We protect information with encryption in transit and at rest, role-based access control, per-tenant
        isolation, audit logging, and prompt deletion of raw documents after filing.</p>

      <h2>7. Notifiable data breaches</h2>
      <p>If a data breach is likely to result in serious harm, we assess it and, where required, notify the
        Office of the Australian Information Commissioner (OAIC) and affected individuals as soon as
        practicable, in line with the Notifiable Data Breaches scheme.</p>

      <h2>8. Access and correction</h2>
      <p>Individuals may request access to, or correction of, their personal information by contacting the
        relevant medical practice; we support practices in responding to these requests.</p>

      <h2>9. Contact &amp; complaints</h2>
      <p>Contact [privacy@yourdomain]. You may also complain to the OAIC at oaic.gov.au.</p>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/privacy-page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/privacy/page.tsx tests/privacy-page.test.tsx
git commit -m "feat(privacy): structured privacy policy with AI-use and overseas-disclosure statements"
```

---

## Task 3: AI-use disclosure in the product UI

**Files:**
- Create: `components/AiUseNotice.tsx`
- Modify: `app/(main)/upload/page.tsx`, `app/(main)/review/[id]/page.tsx`
- Test: `tests/ai-use-notice.test.tsx` (create)

Doc §5: disclose AI use to users in-product, not just in the policy. A small, reusable notice on the upload and review screens.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/ai-use-notice.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AiUseNotice } from '../components/AiUseNotice';

describe('AiUseNotice', () => {
  it('states AI is used and a human confirms', () => {
    render(<AiUseNotice />);
    expect(screen.getByText(/AI/)).toBeInTheDocument();
    expect(screen.getByText(/reviewed|confirm/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ai-use-notice.test.tsx`
Expected: FAIL — component not found.

- [ ] **Step 3: Create the component**

```tsx
// components/AiUseNotice.tsx
export function AiUseNotice() {
  return (
    <p className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
      Fields are extracted with AI and must be reviewed and confirmed by a person before filing.
      Documents are processed onshore; the AI extraction step is performed by an overseas provider under
      contractual safeguards. See our <a className="underline" href="/privacy">privacy policy</a>.
    </p>
  );
}
```

- [ ] **Step 4: Render it on upload and review pages**

In `app/(main)/upload/page.tsx` import and render `<AiUseNotice />` near the top of the form. Do the same in `app/(main)/review/[id]/page.tsx` above the extracted-fields panel:

```tsx
import { AiUseNotice } from "@/components/AiUseNotice";
// ...inside the returned JSX, before the form / fields:
<AiUseNotice />
```

> Match the existing import alias (`@/components/...`) used elsewhere in the repo; if the repo uses relative imports, follow that.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/ai-use-notice.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/AiUseNotice.tsx "app/(main)/upload/page.tsx" "app/(main)/review/[id]/page.tsx" tests/ai-use-notice.test.tsx
git commit -m "feat(transparency): show AI-use disclosure on upload and review screens"
```

---

## Task 4: Forced MFA enrollment flow

**Files:**
- Modify: `app/(auth)/login/actions.ts`
- Create: `app/(auth)/mfa-enroll/page.tsx`, `app/(auth)/mfa-enroll/EnrollForm.tsx`, `app/(auth)/mfa-enroll/actions.ts`
- Test: `tests/login-mfa-enroll.test.ts` (create)

Pairs with backend Task 4. When login returns `mfa_enrollment_required` + `enrol_token`, send the user to a forced enrollment page that calls `/auth/mfa/enrol/setup` then `/auth/mfa/enrol/enable`, which returns real tokens.

- [ ] **Step 1: Write the failing test (login action routing)**

```typescript
// tests/login-mfa-enroll.test.ts
import { describe, it, expect } from 'vitest';
import { routeAfterLogin } from '../app/(auth)/login/actions';

describe('routeAfterLogin', () => {
  it('routes to mfa-enroll when enrollment is required', () => {
    expect(routeAfterLogin({ mfa_enrollment_required: true, enrol_token: 'x' }))
      .toEqual({ kind: 'enrol', token: 'x' });
  });
  it('routes to mfa challenge when mfa is required', () => {
    expect(routeAfterLogin({ mfa_required: true, mfa_token: 'y' }))
      .toEqual({ kind: 'challenge', token: 'y' });
  });
  it('routes to session when tokens are returned', () => {
    expect(routeAfterLogin({ access: 'a', refresh: 'r' })).toEqual({ kind: 'session' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/login-mfa-enroll.test.ts`
Expected: FAIL — `routeAfterLogin` not exported.

- [ ] **Step 3: Add the pure router + wire it into the login action**

In `app/(auth)/login/actions.ts` add (and use inside the existing server action that posts to `/auth/login`):

```typescript
export type LoginResponse = {
  access?: string; refresh?: string;
  mfa_required?: boolean; mfa_token?: string;
  mfa_enrollment_required?: boolean; enrol_token?: string;
};

export function routeAfterLogin(r: LoginResponse):
  | { kind: 'session' } | { kind: 'challenge'; token: string } | { kind: 'enrol'; token: string } {
  if (r.mfa_enrollment_required && r.enrol_token) return { kind: 'enrol', token: r.enrol_token };
  if (r.mfa_required && r.mfa_token) return { kind: 'challenge', token: r.mfa_token };
  return { kind: 'session' };
}
```

In the login server action, after parsing the response, branch on `routeAfterLogin(res)`: `enrol` → `redirect('/mfa-enroll?token=' + token)`; `challenge` → existing MFA challenge path; `session` → set cookies and redirect to dashboard (existing behaviour).

- [ ] **Step 4: Create the enrollment actions**

```typescript
// app/(auth)/mfa-enroll/actions.ts
"use server";
import { redirect } from "next/navigation";
import { setAuthCookies } from "@/lib/auth";

const BASE = process.env.BACKEND_URL!;

export async function startEnroll(enrolToken: string) {
  const r = await fetch(`${BASE}/auth/mfa/enrol/setup`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enrol_token: enrolToken }),
  });
  if (!r.ok) throw new Error("enrol setup failed");
  return r.json() as Promise<{ secret: string; otpauthUrl: string }>;
}

export async function completeEnroll(enrolToken: string, code: string) {
  const r = await fetch(`${BASE}/auth/mfa/enrol/enable`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enrol_token: enrolToken, code }),
  });
  if (!r.ok) return { error: "Invalid code" };
  const data = await r.json();
  await setAuthCookies(data.access, data.refresh);
  redirect("/dashboard");
}
```

- [ ] **Step 5: Create the page + form**

```tsx
// app/(auth)/mfa-enroll/page.tsx
import { startEnroll } from "./actions";
import { EnrollForm } from "./EnrollForm";

export default async function MfaEnrollPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) return <p className="p-8">Missing enrollment token. Please log in again.</p>;
  const { otpauthUrl } = await startEnroll(token);
  return (
    <div className="mx-auto max-w-sm p-8 space-y-4">
      <h1 className="text-lg font-semibold">Set up two-factor authentication</h1>
      <p className="text-sm text-slate-600">Your account role requires MFA. Scan this in your authenticator app, then enter a code.</p>
      <code className="block break-all text-xs bg-slate-50 p-2 rounded">{otpauthUrl}</code>
      <EnrollForm token={token} />
    </div>
  );
}
```

```tsx
// app/(auth)/mfa-enroll/EnrollForm.tsx
"use client";
import { useState } from "react";
import { completeEnroll } from "./actions";

export function EnrollForm({ token }: { token: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <form action={async () => { const r = await completeEnroll(token, code); if (r?.error) setError(r.error); }}
          className="space-y-2">
      <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric"
             placeholder="123456" className="border rounded px-3 py-2 w-full" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="rounded bg-slate-900 text-white px-4 py-2 w-full">Enable MFA</button>
    </form>
  );
}
```

- [ ] **Step 6: Allow the route through middleware**

In `middleware.ts`, add `"/mfa-enroll"` to the `PUBLIC` array (the enrol token authorises it, not a session).

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run tests/login-mfa-enroll.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add "app/(auth)/login/actions.ts" "app/(auth)/mfa-enroll" middleware.ts tests/login-mfa-enroll.test.ts
git commit -m "feat(auth): forced MFA enrollment flow for privileged roles"
```

---

## Task 5: Public sub-processor list page

**Files:**
- Create: `app/sub-processors/page.tsx`
- Modify: `middleware.ts` (add to `PUBLIC`)
- Test: `tests/sub-processors-page.test.tsx` (create)

Doc §7: maintain a sub-processor register. Render it as a public page (referenced by the privacy policy). Source of truth is the backend register (backend Task 2) exposed read-only, or a static mirror here.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/sub-processors-page.test.tsx
import { describe, it, expect } from 'vitest';
import { SUB_PROCESSORS } from '../lib/sub-processors';

describe('sub-processor list', () => {
  it('includes Anthropic and AWS with locations', () => {
    const names = SUB_PROCESSORS.map((s) => s.name);
    expect(names).toContain('Anthropic');
    expect(names).toContain('AWS');
    expect(SUB_PROCESSORS.every((s) => s.location && s.purpose)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/sub-processors-page.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the data + page**

```typescript
// lib/sub-processors.ts
// Mirror of the backend register (inbound-docs-api/src/common/sub-processors.ts).
// Keep in sync, or fetch from the API's read-only endpoint if/when exposed.
export const SUB_PROCESSORS = [
  { name: "Anthropic", purpose: "AI document field extraction", location: "United States" },
  { name: "AWS", purpose: "Hosting, database, object storage, backups", location: "Australia (Sydney)" },
  { name: "Telnyx", purpose: "Inbound/outbound fax", location: "United States" },
  { name: "SendGrid", purpose: "Transactional email", location: "United States" },
];
```

```tsx
// app/sub-processors/page.tsx
import { SUB_PROCESSORS } from "@/lib/sub-processors";

export default function SubProcessorsPage() {
  return (
    <div className="mx-auto max-w-2xl p-8 prose prose-slate">
      <h1>Sub-processors</h1>
      <p>The third parties we engage to help deliver our service. We maintain DPAs / data-handling terms with each.</p>
      <table>
        <thead><tr><th>Provider</th><th>Purpose</th><th>Location</th></tr></thead>
        <tbody>
          {SUB_PROCESSORS.map((s) => (
            <tr key={s.name}><td>{s.name}</td><td>{s.purpose}</td><td>{s.location}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Make the route public**

In `middleware.ts`, add `"/sub-processors"` to the `PUBLIC` array.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/sub-processors-page.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/sub-processors.ts app/sub-processors/page.tsx middleware.ts tests/sub-processors-page.test.tsx
git commit -m "feat(governance): public sub-processor list page"
```

---

## Final Verification

- [ ] Run the full suite: `npx vitest run` — all green.
- [ ] `npm run build` succeeds.
- [ ] Manually confirm: in production build, `Set-Cookie` carries `Secure`; `/privacy` shows AI-use + overseas sections; `/sub-processors` renders; an owner login without MFA lands on `/mfa-enroll`.

## Self-Review notes (spec coverage)

| Checklist item (doc §10) | Covered by |
|--------------------------|-----------|
| #2 Encryption in transit (cookies) | Task 1 |
| #8 Privacy policy incl. AI-use + overseas | Task 2 |
| §5 AI transparency in product | Task 3 |
| #3 MFA | Task 4 (pairs with backend Task 4) |
| #9 Sub-processor register (public) | Task 5 |
