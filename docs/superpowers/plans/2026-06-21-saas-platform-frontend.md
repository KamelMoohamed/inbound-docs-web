# SaaS Platform (Frontend) Implementation Plan — All 11 Points

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. Build S1→S6, each after the matching backend phase.

**Goal:** UI for the SaaS platform layer: consent + email verification + trial + onboarding wizard (S1); SSO login + (rate limiting is backend-only) (S2); data export + account deletion (S3); dunning banner (S4); admin back-office (S5); webhook management (S6).

**Architecture:** Next.js 16 App Router, RSC + server actions, mirroring existing features (channels, settings). Data via `lib/api.ts` / `lib/publicApi`; zod in `lib/types.ts`. Public pages for verify-email + SSO; authed surfaces for the rest.

**Tech Stack:** Next.js 16, React 19, server actions, zod 4, Tailwind v4, vitest + Testing Library.

Depends on `inbound-docs-api/docs/superpowers/plans/2026-06-21-saas-platform-backend.md`.

---

## Conventions

- Components in `components/`, pages in `app/`. Follow channels/settings patterns. Tests `tests/<name>.test.tsx` (vitest). Run one: `npx vitest run tests/<name>.test.tsx`. All: `npm test`. Build: `npm run build`.
- Add zod types to `lib/types.ts` and methods to `lib/api.ts`/`lib/publicApi` before building each page. Each task ends in a commit.

---

# PHASE S1 — Consent, email verification, trial, onboarding

### Task S1.1: Consent checkboxes at signup

**Files:** Modify `app/(auth)/signup/page.tsx`, `actions.ts`; `lib/api.ts` (publicApi.signup adds consent). Test `tests/signupConsent.test.tsx`.

- [ ] **Step 1: Write the failing test** — the signup submit button is disabled until both "I agree to the Terms" and "I agree to the Privacy Policy" checkboxes are checked.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** two checkboxes (links to `/terms`, `/privacy`) in the signup form; pass `tos_accepted`/`privacy_accepted` through the action to `publicApi.signup`. Update `publicApi.signup` signature to include them.
- [ ] **Step 4: Run → PASS. Commit** `feat(web/s1): consent checkboxes at signup`.

### Task S1.2: Verify-email page

**Files:** Create `app/(auth)/verify-email/page.tsx`, `actions.ts`; `lib/publicApi.verifyEmail`. Test `tests/verifyEmail.test.tsx` (action helper).

- [ ] **Step 1: Write the failing test** — the page reads `?token=`; on mount calls `verifyEmail(token)`; shows success ("Trial unlocked") or an error/resend state.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** `publicApi.verifyEmail(token)` → `POST /auth/verify-email`; the page (server component reads `searchParams.token`, calls verify, renders success with a "Go to dashboard" link or an error with a resend button → `api.resendVerification` when logged in).
- [ ] **Step 4: Run → PASS. Commit** `feat(web/s1): verify-email page (unlocks trial)`.

### Task S1.3: Unverified banner

**Files:** Create `components/VerifyBanner.tsx`; render in `app/(main)/layout.tsx`. Test `tests/verifyBanner.test.tsx`.

- [ ] **Step 1: Write the failing test** — given `emailVerified=false`, renders a "Verify your email to unlock your trial" banner with a Resend button; hidden when verified.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** the banner (reads `api.me()`/session `emailVerified`); wire `Resend` to `api.resendVerification`. Render at top of the authed layout.
- [ ] **Step 4: Run → PASS. Commit** `feat(web/s1): unverified-email banner + resend`.

### Task S1.4: Onboarding wizard

**Files:** Create `app/(main)/onboarding/page.tsx`, `OnboardingChecklist.tsx`, `actions.ts`; `lib/api.ts` (`onboarding`, `dismissOnboarding`). Surface on dashboard. Test `tests/onboardingChecklist.test.tsx`.

- [ ] **Step 1: Write the failing test** — given `{ email_verified:true, has_channel:false, has_patients:false, pms_connected:false, has_subscription:false }`, the checklist shows 1 done / 4 remaining with links to `/channels`, `/roster`, `/settings/integrations`, `/billing`; a "Dismiss" button calls the action.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** `OnboardingChecklist` (step rows with done/▢ + CTA links) driven by `api.onboarding()`; a dashboard card showing it until `complete` or `dismissed`. Add `lib/types.ts` `OnboardingStatus`.
- [ ] **Step 4: Run → PASS; `npm run build`. Commit** `feat(web/s1): onboarding checklist wizard`.

---

# PHASE S2 — SSO login

### Task S2.1: SSO config in org settings

**Files:** `lib/api.ts` (`getSso`, `setSso`), create `app/(main)/settings/sso/page.tsx`, `SsoForm.tsx`, `actions.ts`. Test `tests/ssoForm.test.tsx`.

- [ ] **Step 1: Write the failing test** — the form pre-fills `domain`/`issuer`/`client_id`; submitting calls the `save` action; the client secret field is write-only (never pre-filled).
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** the SSO config form (owner/admin) → `api.setSso`; `GET /org/sso` for prefill (no secret). Note "OIDC issuer must support discovery".
- [ ] **Step 4: Run → PASS. Commit** `feat(web/s2): SSO (OIDC) config page`.

### Task S2.2: "Sign in with SSO" on login

**Files:** Modify `app/(auth)/login/page.tsx`; create `components/SsoButton.tsx`. Test `tests/ssoButton.test.tsx`.

- [ ] **Step 1: Write the failing test** — entering a work email and clicking "Sign in with SSO" navigates to `/auth/sso/authorize?domain=<domain>` (assert the built URL/handler call).
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** an email-domain field + "Sign in with SSO" button that redirects the browser to the backend authorize endpoint (which 302s to the IdP; the callback sets cookies and redirects to the dashboard).
- [ ] **Step 4: Run → PASS; `npm run build`. Commit** `feat(web/s2): SSO sign-in entry on login`.

---

# PHASE S3 — Data export + account deletion

### Task S3.1: Data export button

**Files:** `lib/api.ts` (`exportData` → fetch blob), modify `app/(main)/settings/page.tsx` (or org page). Test `tests/exportButton.test.tsx`.

- [ ] **Step 1: Write the failing test** — clicking "Export my data" calls `api.exportData()` and triggers a download (assert the fetch to `/org/export`).
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** an "Export my data" button (owner/admin) that GETs `/org/export` with auth and downloads the returned zip blob.
- [ ] **Step 4: Run → PASS. Commit** `feat(web/s3): tenant data export button`.

### Task S3.2: Delete-account flow

**Files:** Create `app/(main)/settings/danger/page.tsx`, `DeleteAccount.tsx`, `actions.ts`; `lib/api.ts` (`deleteOrg`). Test `tests/deleteAccount.test.tsx`.

- [ ] **Step 1: Write the failing test** — the delete button stays disabled until the user types the exact org name into the confirm field; on confirm it calls the `delete` action with the typed name.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** a "Danger zone" page (owner only) with a type-to-confirm `DeleteAccount` → `api.deleteOrg(confirm)` → clears cookies + redirects to a goodbye page. Warn it is irreversible and cancels billing.
- [ ] **Step 4: Run → PASS; `npm run build`. Commit** `feat(web/s3): delete-account danger zone (type-to-confirm)`.

---

# PHASE S4 — Dunning banner

### Task S4.1: Past-due / grace banner

**Files:** Create `components/BillingBanner.tsx`; render in `app/(main)/layout.tsx`; extend `BillingSummary` type. Test `tests/billingBanner.test.tsx`.

- [ ] **Step 1: Write the failing test** — given `{ past_due:true, grace_until:'<future>' }`, renders an amber "Payment failed — update your card by <date>" banner linking to the Stripe portal; given a past `grace_until`, a red "Processing paused" banner; nothing when `past_due:false`.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** `BillingBanner` driven by `api.billingSummary()` (`past_due`, `grace_until`), CTA → `api.portal()`. Render in the authed layout.
- [ ] **Step 4: Run → PASS; `npm run build`. Commit** `feat(web/s4): dunning / past-due billing banner`.

---

# PHASE S5 — Admin back-office

### Task S5.1: Admin types + API + guarded layout

**Files:** `lib/types.ts` (`AdminTenant`), `lib/api.ts` (`adminTenants`, `adminTenant`, `adminAdjustCredits`, `adminImpersonate`), create `app/(admin)/layout.tsx`. Test `tests/adminTypes.test.ts`.

- [ ] **Step 1: Write the failing test** — `AdminTenant.parse({...})` succeeds (id, name, plan, credit_balance, doc_count).
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** the types + api methods; an `(admin)` route-group layout that `requireSession()` and redirects non-`super_admin` (the session needs `platformRole` — add it to the JWT/session parse in `lib/auth.ts`).
- [ ] **Step 4: Run → PASS. Commit** `feat(web/s5): admin types, api, guarded layout`.

### Task S5.2: Admin tenants list + detail + actions

**Files:** Create `app/(admin)/admin/tenants/page.tsx`, `[id]/page.tsx`, `actions.ts`, `AdjustCredits.tsx`. Test `tests/adjustCredits.test.tsx`.

- [ ] **Step 1: Write the failing test** — `AdjustCredits` requires a non-zero amount + reason before enabling submit; submit calls the `adjust` action.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** the tenants table (`api.adminTenants()`), a detail page with `AdjustCredits` (→ `api.adminAdjustCredits`) and an "Impersonate" button (→ `api.adminImpersonate` → set returned token as the session cookie, redirect to the tenant's dashboard, with a persistent "Impersonating" banner).
- [ ] **Step 4: Run → PASS; `npm run build`. Commit** `feat(web/s5): admin tenants list/detail + credit adjust + impersonate`.

---

# PHASE S6 — Webhook management

### Task S6.1: Webhook types + API

**Files:** `lib/types.ts` (`WebhookEndpoint`), `lib/api.ts` (`listWebhooks`, `createWebhook`, `deleteWebhook`, `testWebhook`).

- [ ] **Step 1:** Add `WebhookEndpoint` schema (`id`, `url`, `events`, `active`) + the api methods. **Step 2:** `npx tsc --noEmit`. **Step 3: Commit** `feat(web/s6): webhook types + api`.

### Task S6.2: Webhook management page

**Files:** Create `app/(main)/settings/webhooks/page.tsx`, `WebhookForm.tsx`, `actions.ts`; `components/NavLinks.tsx` (link under settings). Test `tests/webhookForm.test.tsx`.

- [ ] **Step 1: Write the failing test** — `WebhookForm` requires a valid URL + at least one checked event before enabling submit; on create the returned signing secret is shown once (a copy field).
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** the page: list endpoints (event chips, active toggle, delete, "Send test"), a create form (URL + event checkboxes from `["document.filed","document.failed","writeback.filed"]`) that reveals the one-time secret via the existing `CopyField` component.
- [ ] **Step 4: Run → PASS; `npm run build`. Commit** `feat(web/s6): webhook management page`.

---

## Final verification

- [ ] `npm test` → all vitest pass.
- [ ] `npm run build` → succeeds; new routes present (`/verify-email`, `/onboarding`, `/settings/sso`, `/settings/danger`, `/settings/webhooks`, `/admin/tenants`).
- [ ] Add `/terms` and `/privacy` placeholder legal pages linked from signup (static content owner-provided). Commit.
- [ ] Update `README.md` with the new surfaces. Commit `docs(web): saas platform surfaces`.

## Self-Review notes (already applied)

- **All 11 mapped to UI (or noted backend-only):** consent (S1.1), verify-email + trial (S1.2/1.3), onboarding (S1.4), SSO (S2.1/2.2), rate limiting (backend-only — no UI), export (S3.1), account deletion (S3.2), dunning (S4.1), admin (S5.1/5.2), webhooks (S6.1/6.2).
- **Backend contract alignment:** every `api.*`/`publicApi.*` matches a route/field in `2026-06-21-saas-platform-backend.md` (`/auth/verify-email`, `/auth/resend-verification`, `/onboarding`, `/org/sso`, `/auth/sso/authorize`, `/org/export`, `DELETE /org`, `billingSummary.past_due/grace_until`, `/admin/*`, `/webhooks`). `platformRole` added to the session parse for the admin guard.
- **Reuse:** `CopyField` for the webhook secret; `LowCreditBanner`/`Stat` patterns for the billing/onboarding banners; channels/settings page structure for all CRUD surfaces.
