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
