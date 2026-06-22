# App Completion (Frontend) Implementation Plan — All Phases

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. Each phase depends on the matching backend phase being live.

**Goal:** Build the UI for all 10 functional gaps: notification feed + provider directory + assignment (P1); escalation/SLA settings + overdue surfacing (P2); document disposition + split UI (P3); loop-closure status (P4); reports dashboard (P5); MFA enrolment + login step + org audit view (P6).

**Architecture:** Next.js 16 App Router, RSC + server actions, mirroring the existing channels/roster features. Data through `lib/api.ts` (authed) / `lib/publicApi`; zod schemas in `lib/types.ts`. Small client components for interactive bits; pages are server components.

**Tech Stack:** Next.js 16, React 19, server actions, zod 4, Tailwind v4, vitest + Testing Library, Playwright.

Depends on `inbound-docs-api/docs/superpowers/plans/2026-06-21-app-completion-backend.md`. Reference roadmap: `inbound-docs-api/docs/superpowers/plans/2026-06-21-app-completion-roadmap.md`.

---

## Conventions

- Components in `components/`, pages in `app/`. Follow the channels feature (`page.tsx` server component + `actions.ts` + small client components).
- Unit tests `tests/<name>.test.tsx` (vitest/jsdom). Run one: `npx vitest run tests/<name>.test.tsx`. All: `npm test`. Build: `npm run build`. E2E: `npm run e2e`.
- Add zod types to `lib/types.ts` and methods to `lib/api.ts` before building each page. Each task ends in a commit.

---

# PHASE 1 — Notifications, Providers, Assignment

### Task 1.1: Types + API methods

**Files:** Modify `lib/types.ts`, `lib/api.ts`. Test `tests/p1Types.test.ts`.

- [ ] **Step 1: Write the failing test** — `Provider.parse({...})`, `Notification.parse({...})`, `NotificationFeed.parse({ items, unread })` succeed.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Add schemas to `lib/types.ts`**

```ts
export const Provider = z.object({ id: z.string(), name: z.string(), external_id: z.string().nullable().optional(),
  user_id: z.string().nullable().optional(), active: z.boolean() });
export type Provider = z.infer<typeof Provider>;

export const Notification = z.object({ id: z.string(), type: z.string(), title: z.string(), body: z.string(),
  document_id: z.string().nullable(), read_at: z.string().nullable(), created_at: z.string() });
export const NotificationFeed = z.object({ items: z.array(Notification), unread: z.number() });
export type Notification = z.infer<typeof Notification>;
```

- [ ] **Step 4: Add to `lib/api.ts`** (`api` object)

```ts
  notifications:  async () => NotificationFeed.parse(await get("/notifications")),
  markNotifRead:  (id: string) => post(`/notifications/${id}/read`),
  markAllRead:    () => post("/notifications/read-all"),
  listProviders:  async () => Provider.array().parse(await get("/providers")),
  createProvider: (b: { name: string; user_id?: string }) => post("/providers", b),
  updateProvider: async (id: string, b: Record<string, unknown>) =>
                    fetch(`${BASE}/providers/${id}`, { method: "PATCH", headers: await authHeaders(), body: JSON.stringify(b) }).then(r => r.json()),
  deleteProvider: async (id: string) => fetch(`${BASE}/providers/${id}`, { method: "DELETE", headers: await authHeaders() }).then(r => r.json()),
  assignDoc:      (id: string, b: { provider_id?: string | null; user_id?: string | null }) => post(`/review/${id}/assign`, b),
  myQueue:        async () => ReviewItem.array().parse(await get("/review?assigned_to=me")),
```

Add `Provider, NotificationFeed` to the type import line.

- [ ] **Step 5: Run → PASS; `npx tsc --noEmit`. Step 6: Commit**

```bash
git add lib/types.ts lib/api.ts tests/p1Types.test.ts
git commit -m "feat(web/p1): types + api for notifications, providers, assignment"
```

### Task 1.2: NotificationBell

**Files:** Create `components/NotificationBell.tsx`; modify `components/Nav.tsx`. Test `tests/notificationBell.test.tsx`.

- [ ] **Step 1: Write the failing test** — given `feed={ items:[{...unread}], unread:1 }`, the bell renders a "1" badge; clicking an item calls `onRead(id)`.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement `components/NotificationBell.tsx`** as a client component taking `feed` + `onRead`/`onReadAll` action props (the page passes server actions). Shows unread count badge + a dropdown list; unread rows bold.
- [ ] **Step 4: Run → PASS.** Wire it into `Nav.tsx` (server component fetches `api.notifications()` and passes feed + actions). **Step 5: Commit**

```bash
git add components/NotificationBell.tsx components/Nav.tsx tests/notificationBell.test.tsx
git commit -m "feat(web/p1): notification bell + feed in nav"
```

### Task 1.3: Providers page

**Files:** Create `app/(main)/providers/page.tsx`, `actions.ts`, `ProviderRow.tsx`, `AddProvider.tsx`; modify `components/NavLinks.tsx`. Test `tests/addProvider.test.tsx`.

- [ ] **Step 1: Write the failing test** — `AddProvider` disables submit until `name` is non-empty.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** the page (clone `app/(main)/roster/` structure: list via `api.listProviders()`, `AddProvider` client form → `createProvider` action, `ProviderRow` with edit/active-toggle/delete actions). Add nav link "Providers".
- [ ] **Step 4: Run → PASS; `npm run build`. Step 5: Commit**

```bash
git add "app/(main)/providers" components/NavLinks.tsx tests/addProvider.test.tsx
git commit -m "feat(web/p1): provider directory page"
```

### Task 1.4: Assign control + My-queue toggle

**Files:** Create `components/AssignControl.tsx`; modify `app/(main)/review/[id]/page.tsx` + `actions.ts`, and the review list page. Test `tests/assignControl.test.tsx`.

- [ ] **Step 1: Write the failing test** — `AssignControl` lists providers; selecting one + submitting calls the `assign` action with `{ provider_id, user_id }`.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** `AssignControl` (provider `<select>` from `api.listProviders()`, reuse the `PatientPicker` pattern) wired to an `assign` server action on the review detail page. Add a "My queue" toggle to the review list that swaps `api.listReview()` for `api.myQueue()`.
- [ ] **Step 4: Run → PASS; `npm run build`. Step 5: Commit**

```bash
git add components/AssignControl.tsx "app/(main)/review" tests/assignControl.test.tsx
git commit -m "feat(web/p1): assign-to control + my-queue toggle"
```

---

# PHASE 2 — Escalation settings + overdue surfacing

### Task 2.1: Types + API

**Files:** `lib/types.ts`, `lib/api.ts`.

- [ ] **Step 1:** Add `EscalationPolicy` schema (`urgent_sla_minutes`, `routine_sla_minutes`, `failed_retry_ceiling`, `escalate_to_user_id`) and `api.escalationPolicy()` (GET) + `api.setEscalationPolicy(body)` (PUT via fetch). **Step 2:** `npx tsc --noEmit`. **Step 3: Commit** `feat(web/p2): escalation policy types + api`.

### Task 2.2: Escalation settings page

**Files:** Create `app/(main)/settings/escalation/page.tsx`, `actions.ts`, `EscalationForm.tsx`. Test `tests/escalationForm.test.tsx`.

- [ ] **Step 1: Write the failing test** — form pre-fills from policy; changing `urgent_sla_minutes` and submitting calls the `save` action with the new value.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** the form (number inputs + escalate-to user `<select>` from `api.listOrgUsers()`) → `save` action calls `api.setEscalationPolicy`. Page guarded to owner/admin (check `session.role`).
- [ ] **Step 4: Run → PASS. Step 5: Commit** `feat(web/p2): escalation SLA settings page`.

### Task 2.3: Overdue surfacing on dashboard

**Files:** Modify `app/(main)/dashboard/page.tsx`; reuse `components/Stat.tsx`, `LowCreditBanner.tsx` pattern. Test `tests/overdueBanner.test.tsx`.

- [ ] **Step 1: Write the failing test** — given metrics with `urgent_pending > 0`, an "Overdue urgent" red banner/stat renders.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** an "Overdue / escalated" stat + red banner on the dashboard driven by `api.metrics()` (`urgent_pending`).
- [ ] **Step 4: Run → PASS; `npm run build`. Step 5: Commit** `feat(web/p2): overdue-urgent dashboard surfacing`.

---

# PHASE 3 — Disposition + split UI

### Task 3.1: API methods

**Files:** `lib/api.ts`.

- [ ] **Step 1:** Add `discardDoc(id, reason)` → `post(/review/:id/discard)`, `markDuplicate(id, of_id)` → `post(/review/:id/duplicate)`, `splitDoc(id, ranges)` → `post(/review/:id/split)`. **Step 2:** `npx tsc --noEmit`. **Step 3: Commit** `feat(web/p3): disposition + split api`.

### Task 3.2: Disposition controls on review detail

**Files:** Modify `app/(main)/review/[id]/page.tsx` + `actions.ts`; create `components/DispositionMenu.tsx`. Test `tests/dispositionMenu.test.tsx`.

- [ ] **Step 1: Write the failing test** — `DispositionMenu` shows "Discard" and "Mark duplicate"; clicking "Discard" calls the `discard` action.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** the menu wired to `discard`/`markDuplicate` server actions; hide discarded/duplicate docs from the active list (list already filters server-side). 
- [ ] **Step 4: Run → PASS. Step 5: Commit** `feat(web/p3): discard + duplicate controls`.

### Task 3.3: Split UI

**Files:** Create `components/SplitDialog.tsx`; modify review detail page + actions. Test `tests/splitDialog.test.tsx`.

- [ ] **Step 1: Write the failing test** — entering ranges "1-2, 3" and submitting calls `split` with `["1-2","3"]` (the component parses the comma list).
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** `SplitDialog` (a text input for page ranges over the raw preview; parse comma-separated ranges) → `split` server action. After split, redirect back to the queue.
- [ ] **Step 4: Run → PASS; `npm run build`. Step 5: Commit** `feat(web/p3): fax split dialog`.

---

# PHASE 4 — Loop-closure status

### Task 4.1: Surface filing/task/ack state

**Files:** `lib/types.ts` (extend `ReviewDetail` + `StuckDoc` with `pms_task_id`, `pms_acknowledged_at`, `pms_filing_id`), modify `app/(main)/review/[id]/page.tsx` and `app/(main)/settings/integrations/page.tsx`. Test `tests/loopClosure.test.tsx`.

- [ ] **Step 1: Write the failing test** — a `LoopClosure` component renders "Filed ✓ · Task ✓ · Acknowledged —" from `{ pms_filing_id:'x', pms_task_id:'y', pms_acknowledged_at:null }`.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** a `components/LoopClosure.tsx` badge row; show it on the review detail (when filed) and in the integrations write-back health panel. Extend the backend response fields in `lib/types.ts` (ensure backend includes them in `/review/:id` and `/pms/writeback/stuck`).
- [ ] **Step 4: Run → PASS; `npm run build`. Step 5: Commit** `feat(web/p4): loop-closure status (filed/task/ack)`.

---

# PHASE 5 — Reports dashboard

### Task 5.1: Types + API

**Files:** `lib/types.ts`, `lib/api.ts`.

- [ ] **Step 1:** Add `ReportSummary` schema (`mis_file_rate`, `median_turnaround_seconds`, `auto_file_pct`, `urgent_sla_adherence_pct`, `per_provider: array`) and `api.reportSummary(from, to)`. **Step 2:** `npx tsc --noEmit`. **Step 3: Commit** `feat(web/p5): report types + api`.

### Task 5.2: Reports page

**Files:** Create `app/(main)/reports/page.tsx`; create `lib/reportFormat.ts` (formatters). Modify `components/NavLinks.tsx`. Tests `tests/reportFormat.test.ts`.

- [ ] **Step 1: Write the failing test** — `formatRate(0.037)` → `"3.7%"`, `formatTurnaround(5400)` → `"1h 30m"`.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** `lib/reportFormat.ts`, then the reports page: headline mis-file rate `Stat`, turnaround, auto-file %, SLA adherence, and a per-provider throughput table from `api.reportSummary()`. Add nav link "Reports". Default range last 30 days.
- [ ] **Step 4: Run → PASS; `npm run build`. Step 5: Commit** `feat(web/p5): reports dashboard (mis-file rate + KPIs)`.

---

# PHASE 6 — MFA + org audit

### Task 6.1: MFA enrolment

**Files:** `lib/api.ts` (mfa setup/verify/disable), create `app/(main)/settings/security/page.tsx`, `actions.ts`, `MfaEnroll.tsx`. Test `tests/mfaEnroll.test.tsx`.

- [ ] **Step 1: Write the failing test** — `MfaEnroll` given `{ otpauthUrl, secret }` renders a QR image (or the secret) and a code input; submitting a 6-digit code calls the `verify` action.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** `MfaEnroll` (render the otpauth as a QR via a public QR endpoint or the backend-provided data URL + manual secret fallback; code input) wired to `setup`/`verify`/`disable` actions calling `api.mfaSetup/mfaVerify/mfaDisable`.
- [ ] **Step 4: Run → PASS. Step 5: Commit** `feat(web/p6): MFA enrolment in security settings`.

### Task 6.2: Login MFA step

**Files:** Modify `app/(auth)/login/page.tsx` + `actions.ts`; create `MfaChallenge.tsx`. Test `tests/mfaChallenge.test.tsx`.

- [ ] **Step 1: Write the failing test** — when the login action returns `{ mfa_required: true, mfaToken }`, the page shows `MfaChallenge`; submitting a code calls `mfaLogin(mfaToken, code)`.
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** the two-step login: the `login` action returns the challenge state; `MfaChallenge` collects the code and calls `publicApi.mfaLogin`, then `setAuthCookies`. 
- [ ] **Step 4: Run → PASS; `npm run build`. Step 5: Commit** `feat(web/p6): MFA login challenge step`.

### Task 6.3: Org audit view

**Files:** `lib/api.ts` (`orgAudit(filters)`), create `app/(main)/org/audit/page.tsx`. Test `tests/orgAuditFilters.test.tsx`.

- [ ] **Step 1: Write the failing test** — the filter bar emits the selected `type`/date range to the fetch (test the query-string builder helper).
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** the org-wide audit table (`api.orgAudit({ from, to, type, actor })`) with a filter bar and pagination, owner/admin-guarded. Add a link from the org page.
- [ ] **Step 4: Run → PASS; `npm run build`. Step 5: Commit** `feat(web/p6): org-wide audit log view`.

---

## Final verification

- [ ] `npm test` → all vitest pass.
- [ ] `npm run build` → succeeds; new routes present (`/providers`, `/settings/escalation`, `/reports`, `/settings/security`, `/org/audit`).
- [ ] Update `README.md` with the new surfaces. Commit `docs(web): app-completion surfaces`.

## Self-Review notes (already applied)

- **Phase coverage:** P1 bell/providers/assign (1.1–1.4), P2 escalation settings + overdue (2.1–2.3), P3 disposition + split (3.1–3.3), P4 loop-closure status (4.1), P5 reports (5.1–5.2), P6 MFA + org audit (6.1–6.3). All 10 gaps have a UI surface.
- **Backend contract alignment:** every `api.*` method matches a backend route/field from `2026-06-21-app-completion-backend.md` (`/notifications`, `/providers`, `/review/:id/assign`, `/escalation-policy`, `/review/:id/discard|duplicate|split`, `pms_task_id`/`pms_acknowledged_at`, `/reports/summary`, `/auth/mfa/*`, `/org/audit`). Names kept identical across the two plans.
- **Dependencies:** each phase notes its backend prerequisite; build in the same order as the backend plan.
