# inbound-docs-web

Next.js (App Router) review console for the inbound-document SaaS platform.

## Getting started

```bash
npm install
cp .env.local.example .env.local
# BACKEND_URL defaults to http://localhost:8000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Users authenticate via `/signup` (to create a new organisation) or `/login`. No server-side API key is needed — the backend issues JWT tokens on login.

## Auth & session model

| Cookie | Content | TTL | Flags |
|---|---|---|---|
| `auth_access` | JWT access token | 15 min | httpOnly, SameSite=lax, Secure in prod |
| `auth_refresh` | opaque refresh token | 30 days | httpOnly, SameSite=lax, Secure in prod |

`middleware.ts` handles token refresh transparently: if the access token is expired but a refresh token is present, it silently calls `POST /auth/refresh` and sets new cookies before forwarding the request. No page needs to handle 401 manually.

The browser **never sees the JWT** — tokens live only in httpOnly cookies. `lib/api.ts` is guarded with `import "server-only"` so tokens never reach the browser bundle.

## Pages

| Route | Description |
|---|---|
| `/login` | Sign in with email + password |
| `/signup` | Create a new organisation (owner account) |
| `/forgot-password` | Request a password reset link |
| `/reset-password` | Set a new password via reset link |
| `/invitations/accept` | Accept a team invitation |
| `/` | Review queue — urgent rows first, confidence bands, counts in header |
| `/review/[id]` | Document detail — original doc + extracted fields + matched patient name (Last, First + DOB), change document type, one-click confirm or reassign patient, audit trail |
| `/review/failed` | Failed documents — list with error details and per-doc retry button |
| `/review/held` | Documents held for credits — safely stored, auto-processed on top-up |
| `/upload` | Upload a document — ingest endpoint forwards to the backend worker |
| `/roster` | Patient roster — import a CSV, manually add/edit/delete patients, re-match documents |
| `/dashboard` | ROI metrics — auto-handled %, urgent backlog, filed total, credit balance & usage |
| `/org` | Team management — list users, invite, toggle role, remove, rotate ingestion key |
| `/billing` | Billing & credits — current balance, plan tiers, Stripe Checkout/Portal, transaction history |
| `/channels` | Inbound channel management — backend-provisioned: email shows a forwarding address; fax shows a dedicated number (deleting releases the number upstream, requires confirmation); token/sftp types (fhir, hl7, secure_msg, sftp) show URL + bearer token / host+credentials (rotatable, shown once); email/fax have no rotatable secret |
| `/settings` | Account settings — update display name, change password |
| `/providers` | Provider directory — add, edit, activate/deactivate providers for assignment |
| `/reports` | Reports dashboard — mis-file rate, turnaround, auto-file %, SLA adherence, per-provider throughput |
| `/settings/escalation` | Escalation & SLA settings — urgent/routine SLA minutes, retry ceiling, escalate-to user (owner/admin) |
| `/settings/security` | MFA enrolment — set up TOTP, verify, disable |
| `/org/audit` | Org-wide audit log — filter by date, event type, actor (owner/admin) |

| `/integrations` | Public PMS catalog — tiered grid of supported PMSes (auto-file, roster sync, export-only), links to the request form |
| `/integrations/request` | Public request form — clinic submits PMS name + email; shows confirmation on success |
| `/settings/integrations` | Authed connect surface — select PMS, enter API key or begin OAuth flow, view write-back health panel (stuck docs), sync roster or disconnect |

## Billing & credits

Credit balance, plan information, and transaction history are fetched from the backend over the server-only API client. **No Stripe publishable key or card data ever touches this app** — plan upgrades and subscription management redirect the browser to Stripe-hosted Checkout and Customer Portal pages. The backend issues the redirect URL; the browser follows it directly to Stripe.

A **credit balance pill** in the nav bar shows the current balance (green/amber/red by threshold) and links to `/billing`. A **low-credit banner** appears below the nav when the balance is ≤ 100 or documents are held.

The `/review/held` page lists documents that were received but cannot be processed due to insufficient credits. They are stored safely and will process automatically once credits are topped up — nothing is ever dropped.

## Machine ingestion key

The `/ingest/email` endpoint uses a per-org ingestion key (not a user JWT). Owners and admins can rotate this key from the **Org** page → "Rotate ingestion key".

## Running tests

**Component tests (Vitest + Testing Library):**

```bash
npm test
```

**End-to-end tests (Playwright):**

Requires the backend + worker running.

```bash
npm run e2e
```

## Deployment

Build a Docker image:

```bash
docker build -t inbound-docs-web .
docker run -p 3000:3000 \
  -e BACKEND_URL=https://your-backend \
  inbound-docs-web
```

`BACKEND_URL` is supplied as an environment variable to the running container — never baked into the image.

## PMS integration

Three surfaces built on the `/pms` backend endpoints (requires `BACKEND_URL`):

| Surface | Route | Auth |
|---|---|---|
| Supported PMS catalog | `/integrations` | Public |
| Request a PMS integration | `/integrations/request` | Public |
| Connect your PMS | `/settings/integrations` | Owner / Admin |

**Catalog:** fetched from `GET /pms/catalog` via `publicApi.pmsCatalog()` (no auth). Entries are tiered: `write_back` (auto-files docs), `roster` (patient sync only), `export_only` (works with any PMS).

**Request form:** submits to `POST /pms/requests`. Redirect shows a thank-you page. No auth required.

**Connect surface:** `api_key` PMSes show an API key field; `oauth2` PMSes show an OAuth redirect button. After connecting, owners/admins can sync the roster or disconnect. A write-back health panel lists any stuck documents (filed-but-failed) from `GET /pms/writeback/stuck`.

### Supported adapters

| PMS | Auth | Tier | Capabilities | Status |
|---|---|---|---|---|
| Cliniko | api_key | write_back | roster.read, document.write | live |
| Halaxy | oauth2 | write_back | roster.read, document.write | live |
| Power Diary | api_key | write_back | roster.read, document.write | beta |
| Nookal | api_key | write_back | roster.read, document.write | beta |
| Coreplus | api_key | roster | roster.read | planned — roster-only until self-serve document-write is confirmed |
| Jane | oauth2 | roster | roster.read | planned — roster-only until OAuth write scope is granted |

> **Upgrade path for Coreplus/Jane:** once a `document.write` endpoint is confirmed self-serve, add the capability to the adapter, bump the catalog tier to `write_back`, and reseed. No frontend changes needed.


## App completion

Additional surfaces built on the app-completion backend (`/notifications`, `/providers`, `/review/:id/assign`, `/escalation-policy`, `/reports/summary`, `/auth/mfa/*`, `/org/audit`):

| Feature | Where |
|---|---|
| Notification feed | Bell in nav — unread count, mark read / mark all read |
| Provider directory | `/providers` — CRUD for assignable providers |
| Document assignment | Review detail — assign to provider; review queue — "My queue" toggle |
| Escalation / SLA | `/settings/escalation` — policy form; dashboard — overdue urgent banner |
| Disposition | Review detail — discard + mark duplicate |
| Fax split | Review detail — page-range split dialog |
| Loop closure | Review detail + PMS write-back health — filed / task / ack status |
| Reports | `/reports` — KPI dashboard (default last 30 days) |
| MFA | `/settings/security` enrolment; login — MFA challenge step when required |
| Org audit | `/org/audit` — filterable event log linked from Org page |
