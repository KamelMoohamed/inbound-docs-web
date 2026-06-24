# CliniDoc — Adversarial Test Plan

A "break it on purpose" QA plan for the CliniDoc web app. The goal is not to confirm
the happy path works — it's to find the cases that silently corrupt clinical data, leak
PII across tenants, or let a user do something their role shouldn't allow.

**Treat every test as guilty until proven innocent.** A button that looks like it worked
is not a pass — verify the backend state, the audit trail, and that nothing leaked.

---

## 0. Environment & test data

Set up before you start. Many tests are meaningless without the right fixtures.

### Accounts (need at least these)
- **Owner A** — owner of Tenant A (full permissions).
- **Admin A** — admin role in Tenant A.
- **Member A** — plain member/reviewer in Tenant A.
- **Owner B** — owner of a *separate* Tenant B (for cross-tenant isolation tests).
- **Super-admin** — platform `super_admin` (for `/admin`).
- **Unverified user** — signed up, email not yet verified.
- **MFA user** — has TOTP enrolled.
- **SSO user** — belongs to a tenant with SSO configured.

### Seed data in Tenant A
- A patient roster with: an exact-match patient, two near-duplicate patients (same name,
  different DOB), a patient with an apostrophe/unicode name (e.g. `O'Brien`, `Nguyễn`).
- Providers: at least one active, one inactive/archived.
- Inbox documents in every state: needs-review, high-confidence match, **no** match,
  low-confidence match, urgent, a multi-page fax (for split), a failed-processing doc,
  a held doc, an already-filed doc, a duplicate.
- A tenant with **zero credits** and one **near zero** (to hit billing gates).

### Tooling
- Browser DevTools open (Network + Console) on **every** page — console errors are bugs.
- A second browser/incognito session logged in as a different role for concurrency tests.
- Ability to edit cookies / replay requests (DevTools or a proxy) for the security suite.

---

## 1. Cross-cutting checks — run on EVERY page

This is the "press all the buttons" discipline. On each route below, do all of this:

1. **Click every interactive element** — buttons, links, menu items, toggles, tabs,
   dropdowns, icons (the notification bell, credit pill, settings menu, account menu).
2. **Double-click and rapid-click** every submit button — verify no double-submission
   (e.g. two documents filed, two invites sent, two charges). Buttons should disable
   while pending.
3. **Submit every form empty**, then with only-whitespace, then with max-length+1 input.
4. **Console must stay clean** — zero errors/warnings after interaction.
5. **Back/forward button** after each action — stale state? Re-POST prompt? Broken UI?
6. **Refresh mid-flow** — does in-progress state survive or fail gracefully?
7. **Resize to 375px (mobile), 768px, 1440px** — nav collapses, nothing overflows,
   the logo/brand lockup stays intact, no horizontal scroll.
8. **Keyboard only** — Tab through, Enter/Space activate, Esc closes dialogs, focus is
   visible and trapped inside modals.
9. **Deep-link directly** to the URL (paste in fresh tab) — does it load or redirect
   sensibly?
10. **Logo/brand** renders (icon + "Clini" dark / "Doc" indigo), links home, and is the
    favicon in the tab.

---

## 2. Marketing & lead capture  `(marketing)`

Routes: `/`, `/pricing`, `/integrations`, `/integrations/request`, `/security`, `/about`,
`/contact`, `/privacy`, `/terms`, `/dpa`, `/sub-processors`.

| ID | Test | Expected |
|----|------|----------|
| MK-1 | Visit every marketing page logged out | Loads, header/footer render, all nav + footer links resolve (no 404) |
| MK-2 | Click every CTA ("Start free", "Book a demo") | Routes to signup/contact correctly |
| MK-3 | Visit `/` while **logged in** with valid session | Redirects to `/inbox` (middleware rule) |
| MK-4 | Submit `/contact` form empty | Validation errors, no submission |
| MK-5 | Submit `/contact` with XSS payload in every field (`<script>alert(1)</script>`, `"><img src=x onerror=alert(1)>`) | Stored/displayed safely, never executes |
| MK-6 | Submit `/contact` with a 10,000-char message | Rejected or truncated gracefully, no 500 |
| MK-7 | Submit `/contact` twice fast (double-click) | Only one lead created |
| MK-8 | `/integrations/request` form same adversarial inputs as MK-5/6 | Safe |
| MK-9 | Footer legal links (privacy/terms/dpa/sub-processors) | All present and load — these are compliance-critical for AU health |
| MK-10 | Tab/keyboard through contact form, submit with Enter | Works |

---

## 3. Signup & tenant creation  `(auth)/signup`

| ID | Test | Expected |
|----|------|----------|
| SU-1 | Happy path: valid org + email + strong password, all 3 consent boxes ticked | Account + tenant created, lands in app/verify flow |
| SU-2 | Submit with **any** consent box unticked | Submit disabled (canSubmit = tos && privacy && dpa) — verify all 3 combinations |
| SU-3 | Tick all 3, untick one via keyboard, try Enter-submit | Still blocked |
| SU-4 | Weak password (`123`, `password`, all spaces) | Rejected with clear message |
| SU-5 | Email already registered | Friendly error, no account enumeration leak (timing/message identical to success-ish) |
| SU-6 | Malformed emails (`a@`, `@b.com`, `a b@c.com`, unicode) | Rejected |
| SU-7 | Org name with XSS / 1000 chars / emoji / leading-trailing spaces | Sanitised, no break |
| SU-8 | Double-submit the form | Exactly one tenant created |
| SU-9 | SQL/NoSQL injection in org + email (`' OR 1=1--`) | Treated as literal string |
| SU-10 | Network offline mid-submit, then retry | No duplicate, clear error |

---

## 4. Login, MFA, SSO  `(auth)/login`, `/mfa-enroll`

| ID | Test | Expected |
|----|------|----------|
| LI-1 | Valid credentials | Logged in, redirected to app |
| LI-2 | Wrong password ×N | Generic "invalid credentials", **rate-limited / lockout** after threshold |
| LI-3 | Unverified user logs in | Routed to verify-email gate, can't reach app data |
| LI-4 | MFA-enabled user → password step → wrong TOTP | Rejected; **expired/used TOTP** rejected; reused code rejected |
| LI-5 | MFA challenge: brute-force codes rapidly | Rate-limited |
| LI-6 | MFA token from the password step replayed/expired | Rejected |
| LI-7 | SSO button with valid work email (tenant has SSO) | Initiates SSO; with non-SSO email → sensible fallback |
| LI-8 | SSO email for a different tenant's domain | Does not cross tenants |
| LI-9 | `/mfa-enroll`: enroll, verify with correct code | Enrolled; show recovery/backup codes once |
| LI-10 | Log in two sessions, log out one | Other session behaviour matches policy (revoked or independent — confirm intended) |
| LI-11 | "Log in" link from marketing, Enter-to-submit, autofill | Works |
| LI-12 | Account/Settings menu → Logout | Session + cookies cleared; back button can't re-enter app |

---

## 5. Password reset, email verification, invitations  `(auth)`

| ID | Test | Expected |
|----|------|----------|
| PR-1 | Forgot-password with registered email | "Sent" message — **identical** message for unregistered email (no enumeration) |
| PR-2 | Reset with valid token | Password changed, token consumed |
| PR-3 | Reset with **expired / already-used / tampered** token | Rejected |
| PR-4 | Reset link `?token=` empty / missing / garbage | Graceful error, no 500 |
| PR-5 | Reuse a valid reset link twice | Second use fails |
| PR-6 | Old password still works after reset? | **Must not** |
| PR-7 | Verify-email with valid / expired / reused / missing token | Correct handling each case |
| PR-8 | Invitation accept: valid token → set password / join | Joins correct tenant with invited role |
| PR-9 | Invitation: expired/invalid token | "Invalid or expired" message (already coded — confirm) |
| PR-10 | Invitation token for Tenant A used while logged in as Tenant B user | No tenant mix-up / privilege bleed |
| PR-11 | Accept same invite twice | Second attempt fails cleanly |

---

## 6. Onboarding  `(main)/onboarding`

| ID | Test | Expected |
|----|------|----------|
| OB-1 | Fresh tenant lands on onboarding checklist | Steps shown, incomplete |
| OB-2 | Complete each step, refresh | Progress persists |
| OB-3 | Click each onboarding link/CTA | Routes to the right setup page |
| OB-4 | Skip onboarding by deep-linking to `/inbox` | Allowed or gated per intended design — confirm |

---

## 7. Inbox & review queue  `(main)/inbox`, `/review/held`, `/review/failed`

| ID | Test | Expected |
|----|------|----------|
| IQ-1 | Open inbox with mixed-state docs | Renders, urgent flagged, confidence badges correct |
| IQ-2 | Queue toggle / filters (QueueToggle component) | Filters correctly, URL/state consistent |
| IQ-3 | Open a doc, go back | List position/scroll sane |
| IQ-4 | Empty inbox | Friendly empty state, no crash |
| IQ-5 | `/review/held` and `/review/failed` lists | Load; actions available match state |
| IQ-6 | Failed-processing doc: retry/disposition actions | Work; failed doc can't be "filed" as if success |
| IQ-7 | Bulk/assign controls if present | Apply to correct rows only |
| IQ-8 | Sort/paginate large queue (seed 100+ docs) | Performs, no duplicate rows, stable ordering |

---

## 8. Review detail — THE CORE FLOW  `(main)/review/[id]`

This is where clinical data gets filed into the patient record. Bugs here are the worst.
Buttons/forms on this page: **Save type**, **Assign to provider**, **Confirm & file**,
**Reassign patient** (PatientPicker), **Split fax** (SplitDialog), **Disposition** menu
(Discard / Mark duplicate), Back-to-queue link, raw-image render.

| ID | Test | Expected |
|----|------|----------|
| RV-1 | Doc **with** matched patient → "Confirm & file" | Files to PMS, status→filed, **audit event written**, loop-closure shows filing/task IDs |
| RV-2 | Doc with **no** matched patient → "Confirm & file" button | **Disabled** (`disabled={!doc.matched_patient_id}`) — verify it can't be force-submitted via DevTools either |
| RV-3 | Force the confirm POST with no patient via replayed request | Server rejects — UI disable is not the only guard |
| RV-4 | Change "Document type" → Save type | Persists, audit logged, doesn't silently re-file |
| RV-5 | Save type with each of the 6 enum values | All valid; a forged value via request → rejected |
| RV-6 | Assign to provider (active) | Assigned, audit logged |
| RV-7 | Assign to **inactive/archived** provider | Blocked or clearly handled |
| RV-8 | Reassign patient (PatientPicker) to a different patient, then Confirm | Files to the **reassigned** patient, not the original match — verify the actual filed patient ID |
| RV-9 | Reassign to near-duplicate patient (same name diff DOB) | Correct patient chosen; DOB shown to disambiguate |
| RV-10 | Split fax (SplitDialog): split a multi-page doc into N | N child docs created, page ranges correct, parent state correct, no page lost/duplicated |
| RV-11 | Split with invalid ranges (overlapping, out-of-bounds, empty, reversed) | Rejected with message |
| RV-12 | Disposition → Discard (with/without reason) | Doc discarded, audit logged, can't then be filed |
| RV-13 | Disposition → Mark duplicate | Linked to original, not double-filed |
| RV-14 | **Concurrency:** two reviewers open same doc; both click Confirm | Only one files; second gets "already actioned", no double-filing |
| RV-15 | Confirm an **already-filed** doc again | Idempotent / blocked, no second PMS filing |
| RV-16 | Double-click "Confirm & file" | Single filing only |
| RV-17 | **IDOR:** open `/review/<id-from-Tenant-B>` as Tenant A | 403/404, no data leak (this is the headline security test) |
| RV-18 | Open `/review/<nonexistent-id>` and `/review/<garbage>` | Clean 404, no stack trace |
| RV-19 | Raw image `/api/raw/<id>` requested cross-tenant | Denied |
| RV-20 | Extracted fields containing HTML/script (from OCR) | Rendered as text, never executed (XSS via document content) |
| RV-21 | Audit trail reflects **every** action above with correct actor + timestamp | Complete, append-only (no edits/deletes) |
| RV-22 | AI use notice present on the page | Shown (compliance) |
| RV-23 | Member vs Admin: can a plain member file/discard? | Matches role policy |

---

## 9. Upload  `(main)/upload`

| ID | Test | Expected |
|----|------|----------|
| UP-1 | Upload valid PDF/image | Accepted, enters queue |
| UP-2 | Upload disallowed type (.exe, .zip, .svg-with-script, 0-byte file) | Rejected |
| UP-3 | Upload oversized file (e.g. >max MB) | Rejected with clear limit |
| UP-4 | Upload with no credits / out of credits | Gated by billing, clear message |
| UP-5 | Upload many files at once / rapid repeated | No duplicates, no race |
| UP-6 | Cancel mid-upload, navigate away | No orphaned/partial doc |
| UP-7 | Filename with XSS/unicode/very long | Sanitised |
| UP-8 | Drag-drop vs file-picker (both paths) | Both work |

---

## 10. Providers & roster  `(main)/providers`, `/roster`

| ID | Test | Expected |
|----|------|----------|
| PRv-1 | Add/edit/archive provider | Persists, audit'd |
| PRv-2 | Duplicate provider | Prevented or flagged |
| RO-1 | Roster import (RosterImportForm): valid CSV | Imports, row count correct |
| RO-2 | Malformed CSV (missing columns, extra columns, wrong encoding, BOM, huge file) | Clear per-row errors, no partial-corrupt import |
| RO-3 | CSV with formula injection (`=cmd`, `+`, `@`, `-` leading) | Neutralised (no CSV-injection on re-export) |
| RO-4 | CSV with duplicate patients / same name diff DOB | Handled, no silent merge |
| RO-5 | Unicode names, apostrophes, very long names | Stored correctly, display correctly |
| RO-6 | Import then check matching improves on a no-match doc | Re-match works |

---

## 11. Channels  `(main)/channels`

| ID | Test | Expected |
|----|------|----------|
| CH-1 | Create each channel type (fax/email/etc.) | Created, credentials/endpoints shown |
| CH-2 | Copy field (CopyField) | Copies correct value |
| CH-3 | Reveal credentials (CredentialsPanel) | Masked by default, reveal works, not logged to console |
| CH-4 | Delete/disable a channel | Confirmation required; inbound to it then stops |
| CH-5 | Invalid channel config | Rejected |

---

## 12. Settings  `(main)/settings/*`

Sub-pages: `settings`, `security`, `sso`, `webhooks`, `integrations`, `escalation`, `danger`.

| ID | Test | Expected |
|----|------|----------|
| ST-1 | Account page: update profile fields | Saves, validation on bad input |
| ST-2 | Security: enable/disable MFA, regenerate backup codes | Requires re-auth/current password; old codes invalidated |
| ST-3 | Security: change password (wrong current pw) | Rejected |
| ST-4 | SSO config: set up, save bad metadata/URL | Validated; can't lock yourself out |
| ST-5 | Webhooks: add endpoint, send test, bad URL (`http://`, localhost, internal IP) | SSRF guarded — internal/metadata IPs blocked |
| ST-6 | Webhooks: signing secret shown once, rotate | Old secret invalidated |
| ST-7 | Integrations: connect/disconnect PMS | State correct; disconnect stops filing |
| ST-8 | Escalation rules: set thresholds, invalid values (negative, huge) | Validated |
| ST-9 | **Danger zone / Delete account** (DeleteAccount): requires typed confirmation | Can't trigger accidentally; double-confirm |
| ST-10 | Delete account as a **member** (not owner) | Blocked |
| ST-11 | Each settings sub-page deep-linked as wrong role | Authz enforced |

---

## 13. Org / team & audit  `(main)/org`, `/org/audit`

| ID | Test | Expected |
|----|------|----------|
| OR-1 | Invite member (each role) | Invite sent once; appears pending |
| OR-2 | Invite existing member / external | Handled |
| OR-3 | Change a member's role | Audit'd; **can't remove last owner** / demote self below owner |
| OR-4 | Remove a member | Their sessions revoked; their assigned docs handled |
| OR-5 | Member tries to invite/remove others | Blocked by role |
| OR-6 | Audit log `/org/audit`: filter, paginate, export | Accurate, append-only, no other-tenant rows |
| OR-7 | Audit log shows the security-relevant events from §8/§12 | Present with actor + time |

---

## 14. Billing & credits  `(main)/billing`

| ID | Test | Expected |
|----|------|----------|
| BI-1 | View plan/credits (CreditPill, PlanCard) | Accurate balance |
| BI-2 | Upgrade/downgrade/cancel plan buttons | Correct flow; no double-charge on double-click |
| BI-3 | AdjustCredits (admin) | Audit'd; can't go negative unexpectedly |
| BI-4 | Zero-credit tenant: upload/file blocked | LowCreditBanner / BillingBanner shown; OverdueBanner if overdue |
| BI-5 | Banners (Billing/LowCredit/Overdue/Verify) appear/dismiss correctly | Right banner for right state, dismiss persists sensibly |
| BI-6 | Member views billing | Read-only or blocked per policy |

---

## 15. Reports & dashboard  `(main)/dashboard`, `/reports`

| ID | Test | Expected |
|----|------|----------|
| DR-1 | Dashboard stats render with data and with empty data | No NaN/undefined, no divide-by-zero |
| DR-2 | Reports: date-range filters incl. inverted range, future dates | Validated |
| DR-3 | Export (ExportButton): CSV/PDF | Correct data, current tenant only, CSV-injection safe |
| DR-4 | Large dataset | Performs, no timeout |

---

## 16. Notifications  (NotificationBell)

| ID | Test | Expected |
|----|------|----------|
| NO-1 | Bell shows unread count | Matches feed |
| NO-2 | Mark one read / mark all read | Count updates, persists across refresh |
| NO-3 | Click a notification | Routes to the related doc/page |
| NO-4 | Backend unavailable (feed fetch fails) | Nav still renders (Nav catches the error) — verify graceful |

---

## 17. Admin / impersonation  `(admin)` — super_admin only

| ID | Test | Expected |
|----|------|----------|
| AD-1 | Non-super_admin opens `/admin/tenants` | Redirected to `/inbox` (layout guard) — confirm |
| AD-2 | super_admin lists tenants, opens `/admin/tenants/[id]` | Loads correct tenant |
| AD-3 | Tenant actions (suspend/adjust/impersonate) | Audit'd platform-side |
| AD-4 | **Impersonation:** start, ImpersonatingBanner shows, stop | Banner always visible while impersonating; stop fully reverts; actions logged as impersonated |
| AD-5 | Forge `platformRole` in cookie/JWT to reach admin | Rejected (server verifies, not just the layout check) |
| AD-6 | Admin dark-theme brand lockup renders ("Clini" white / "Doc" indigo) | Correct on dark bg |

---

## 18. RBAC matrix — run as EACH role

For every role (Owner, Admin, Member, Super-admin, Unverified, logged-out), hit every
route and every destructive action. Build a grid: **rows = actions, columns = roles**,
cell = allowed/denied. The bugs hide where the **UI hides a button but the server still
accepts the request.** For each "denied in UI" action, **replay the request directly**
and confirm the server also denies it.

Key things that must be denied:
- Logged-out → any `(main)` route → redirect to `/login` (middleware).
- Unverified → app data gated.
- Member → admin/owner-only actions (delete account, billing changes, role changes,
  member removal, admin panel).
- Any user → another tenant's documents, patients, reports, audit, channels (IDOR).

---

## 19. Security suite (cross-cutting)

| ID | Test | Expected |
|----|------|----------|
| SEC-1 | **Tenant isolation / IDOR**: enumerate IDs across documents, patients, providers, channels, webhooks, audit, reports | Every cross-tenant access denied |
| SEC-2 | **Auth bypass**: tamper/expire/strip `auth_access` & `auth_refresh` cookies; forge JWT claims (role, tenant, exp) | Server rejects; middleware refresh path doesn't trust a bad refresh token |
| SEC-3 | **Session**: cookies `HttpOnly` + `Secure` + `SameSite`; logout truly revokes; idle/absolute expiry | All set (check cookieOptions) |
| SEC-4 | **XSS**: stored (doc content, names, org name, contact form, filenames) + reflected (query params, error messages) | Never executes |
| SEC-5 | **CSRF**: server actions / state-changing POSTs from a foreign origin | Blocked (origin/token) |
| SEC-6 | **SSRF**: webhook URL + any user-supplied URL → internal IPs, `localhost`, cloud metadata `169.254.169.254`, `file://` | Blocked |
| SEC-7 | **Injection**: SQL/NoSQL in search/filter/login; CSV/formula injection in import & export | Neutralised |
| SEC-8 | **Rate limiting**: login, MFA, password reset, contact form, upload | Throttled |
| SEC-9 | **PII in transport/logs**: no patient data in URLs, console, localStorage, or client error reports | Clean |
| SEC-10 | **Open redirect**: any `?redirect=`/`?next=` style param | Only same-origin allowed |
| SEC-11 | **Direct file access**: `/api/raw/<id>` without auth / cross-tenant | Denied |
| SEC-12 | **Static asset bypass** (the middleware matcher change): confirm only static files (png/jpg/svg/woff…) bypass auth, NOT app routes dressed up to look static (`/inbox.png`, `/review/123.svg`) | App routes still gated |

> **SEC-12 is specific to a recent change:** the middleware matcher was widened to let
> `public/` assets through. Verify it didn't accidentally open an auth hole for routes
> that merely end in an image extension.

---

## 20. Data integrity & concurrency

| ID | Test | Expected |
|----|------|----------|
| DI-1 | Two tabs editing the same doc/provider/patient | Last-write or conflict handling is defined, no silent loss |
| DI-2 | File a doc while another user reassigns its patient | No filing to the wrong/old patient |
| DI-3 | Refresh / network drop mid-action | No partial state; retry is idempotent |
| DI-4 | Roster import interrupted halfway | All-or-nothing or clearly partial with report |
| DI-5 | Credit decrement on file vs failed file | Credit only consumed on success; no double-decrement |

---

## 21. Compliance (AU clinical context)

| ID | Test | Expected |
|----|------|----------|
| CO-1 | AI-use notice present wherever AI output is shown (review detail) | Shown |
| CO-2 | Audit trail is complete + append-only for all clinical actions | Verified across §8/§13 |
| CO-3 | "Hosted in Australia" / data-residency claims match reality | No third-country calls in Network tab |
| CO-4 | Legal docs reachable (privacy, terms, DPA, sub-processors) | All load |
| CO-5 | Account/data deletion actually removes data (danger zone) | Confirm downstream |
| CO-6 | Patient PII not exposed to wrong tenant/role anywhere | Re-confirm against §18/§19 |

---

## 22. Non-functional

| ID | Test | Expected |
|----|------|----------|
| NF-1 | Every page at 375 / 768 / 1440px | No overflow, nav collapses, brand intact |
| NF-2 | Keyboard-only full traversal of a core flow (login → review → file) | Completable |
| NF-3 | Screen-reader labels on icon-only buttons (bell, menu, copy, logo `alt`) | Present |
| NF-4 | Colour contrast on badges/banners (esp. urgent/danger) | WCAG AA |
| NF-5 | Slow 3G throttle | Loading states, no layout jank, no double-submit window |
| NF-6 | Error boundaries: kill the backend, hit each page | Friendly errors, never a white screen or raw stack |
| NF-7 | 404 (`not-found.tsx`) and unknown deep links | Branded 404, link home |
| NF-8 | Browser matrix: Chrome, Safari, Firefox | Consistent |

---

## How to run this

1. **Smoke first** — one happy path through each major flow to confirm the build is sane.
2. **Then go destructive** — work §8, §18, §19 hardest; those hold the highest-severity
   bugs (clinical mis-filing, tenant leakage, privilege escalation).
3. **Log every finding** with: ID, steps, expected, actual, severity, screenshot/HAR.
4. **Severity bar for a clinical product:** any cross-tenant data exposure, any
   mis-filing to the wrong patient, or any audit-trail gap = **P0, ship-blocker.**
