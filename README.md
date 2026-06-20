# inbound-docs-web

Next.js 14 (App Router) review console for the inbound-document MVP.

## Getting started

```bash
npm install
cp .env.local.example .env.local
# Paste the backend tenant API key into BACKEND_API_KEY (printed by `npm run seed` in the backend repo)
# BACKEND_URL defaults to http://localhost:8000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|---|---|
| `/` | Review queue — urgent rows first, confidence bands, counts in header |
| `/review/[id]` | Document detail — original doc + extracted fields + one-click confirm or reassign patient |
| `/upload` | Upload a document — ingest endpoint forwards to the backend worker |
| `/roster` | Import a CSV patient roster |
| `/dashboard` | ROI metrics — auto-handled %, urgent backlog, filed total |

## Running tests

**Component tests (Vitest + Testing Library):**

```bash
npm test
```

**End-to-end tests (Playwright):**

Requires the backend + worker running, tenant seeded, roster imported, and at least one document processed into `needs_review`.

```bash
npm run e2e
```

## Security

`BACKEND_API_KEY` is a **server-only** environment variable (never prefixed with `NEXT_PUBLIC_`). It is read via `import "server-only"` guards in `lib/api.ts` and proxied through Route Handlers (`/api/raw/[id]`, `/api/patients`). The browser never receives the key.

## Deployment

Build a Docker image:

```bash
docker build -t inbound-docs-web .
docker run -p 3000:3000 \
  -e BACKEND_URL=https://your-backend \
  -e BACKEND_API_KEY=your-key \
  inbound-docs-web
```

`BACKEND_URL` and `BACKEND_API_KEY` are supplied as environment variables to the running container — never baked into the image.
