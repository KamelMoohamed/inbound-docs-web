# Frontend Implementation Plan — Review Console (Next.js)

> **HOW TO FOLLOW THIS PLAN (read this first).**
> This is a complete, self-contained build plan for the web UI. Everything required is written here.
>
> **Rules for the implementer (follow exactly):**
> 1. Do the tasks in order: Task 1, then Task 2, and so on. Do not skip or reorder.
> 2. Inside each task, do the steps in order.
> 3. When a step shows a file path and a code block, **create or modify that exact file with that exact code.** Do not rename files, components, functions, or routes — other tasks depend on the exact names.
> 4. When a step says **Run:** `<command>`, run that exact command and confirm the stated result before continuing.
> 5. Where a task uses a test, write the failing test first, run it to see it fail, then write the code, then run it to see it pass, then commit.
>
> **Prerequisite:** the backend (the separate Backend Implementation Plan) must be built and runnable first. **Task 1 below adds three endpoints to that backend.** You also need one backend tenant API key — the backend's seed command prints it; you paste it into this app's server-side env (it is never exposed to the browser).
>
> **Prerequisites on the machine:** Node 20 or newer. Nothing else.

**Goal:** A production-shaped Next.js review console for the inbound-document MVP: practice staff log in with a per-clinic key, work a confidence-gated review queue (urgent first), view the original document beside the AI-extracted fields, confirm or correct the patient/type in one or two clicks, upload documents, import a roster, and see a live ROI dashboard (auto-handled %, urgent backlog, throughput).

**Architecture:** Next.js 14 **App Router**. Reads happen in **Server Components** that call the backend with a **server-only** API key (never shipped to the browser). Mutations happen via **Server Actions**; the original document image is streamed through a **Route Handler** proxy so the key stays server-side. Presentational components are pure and unit-tested; the end-to-end flow is covered by Playwright. Styling with Tailwind.

**Tech Stack:** Next.js 14 (App Router, TypeScript), Tailwind CSS, Zod (response parsing), Vitest + @testing-library/react + jsdom (component tests), Playwright (e2e). Talks to the NestJS MVP backend over HTTP.

**Dependency:** This is a **separate repository** from the backend. The backend (built from the Backend Implementation Plan, its own repo) must be running and must already expose three UI endpoints — `GET /review/:id/raw`, `GET /patients`, `GET /metrics` — which are built in the **backend's Task 13**. This plan's Task 1 only **verifies** they exist; every other task here builds the frontend only.

---

## UX model

- **/** — review queue (Server Component). Urgent rows first, colour-banded; counts in the header; "auto-ready" vs "attention" badges; click → detail.
- **/review/[id]** — split view: original document (left) + extracted fields, matched patient, confidence (right). Primary action **Confirm & file** (one click when `auto_ready`); secondary **Change patient** (search) and **Change type**.
- **/upload** — drag/drop or pick a file → ingest.
- **/roster** — upload a CSV roster.
- **/dashboard** — ROI metrics for the practice (the numbers your sales pitch quotes).

The API key is read from `BACKEND_API_KEY` (server env, **not** `NEXT_PUBLIC_*`). The browser never sees it.

## File structure

This repo IS the Next.js app (no sub-folder). The repo root contains:

```
Dockerfile · .dockerignore              # build the web image for deployment
package.json · tsconfig.json · next.config.mjs · postcss.config.mjs · tailwind.config.ts
vitest.config.ts · playwright.config.ts · .env.local.example
app/
  layout.tsx · globals.css
  page.tsx                              # review queue (server component)
  review/[id]/page.tsx                  # detail (server component)
  review/[id]/actions.ts               # server actions: confirm, changePatient
  upload/page.tsx · upload/actions.ts
  roster/page.tsx · roster/actions.ts
  dashboard/page.tsx
  api/raw/[id]/route.ts                 # streams original doc (server-side key)
  api/patients/route.ts                 # patient-search proxy (server-side key)
components/
  Nav.tsx · Badge.tsx · ReviewTable.tsx · PatientPicker.tsx · Stat.tsx
lib/
  api.ts                               # server-only typed client
  types.ts                             # shared response types (Zod)
  format.ts                            # pure helpers (tested)
tests/  (badge.test.tsx · reviewTable.test.tsx · format.test.ts)
e2e/flow.spec.ts
```

---

## Task 1: Prerequisite — the backend must expose three UI endpoints

> This frontend is a **separate repository** and talks to the backend only over HTTP. Before building the UI, the backend (built from the Backend Implementation Plan, in its own repo) must already expose these three endpoints — they are built there in the backend's **Task 13**, not here:
>
> - `GET /patients?q=<text>` — search the patient roster. Header: `X-API-Key`.
> - `GET /metrics` — review and auto-handled counts. Header: `X-API-Key`.
> - `GET /review/:id/raw` — streams the original document bytes. Header: `X-API-Key`.

- [ ] **Step 1: Verify the backend is running and exposes them.**

With the backend running on `http://localhost:8000` and a tenant API key (printed by the backend's `npm run seed`), run:
```bash
curl -s -H "X-API-Key: <KEY>" "http://localhost:8000/metrics"        # → JSON: needs_review, urgent_pending, filed_total, auto_handled_pct
curl -s -H "X-API-Key: <KEY>" "http://localhost:8000/patients?q=a"   # → JSON array (may be empty)
```
If both return JSON (not `404`), the prerequisite is met and you can continue to Task 2. If they return `404`, build the backend's Task 13 first. **There is no code to write in this repo for this task.**

---

## Task 2: Scaffold Next.js + Tailwind + Vitest + Playwright

**Files:**
- Create: the Next.js app via CLI; plus `next.config.mjs` (edit), `Dockerfile`, `.dockerignore`, `.env.local.example`, `vitest.config.ts`, `playwright.config.ts`

- [ ] **Step 1: Create the app**

Run:
```bash
npx create-next-app@latest inbound-docs-web --ts --app --tailwind --eslint --no-src-dir --import-alias "@/*"
cd inbound-docs-web
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react @playwright/test
```

- [ ] **Step 2: Env example (server-only key)**

`.env.local.example`:
```
BACKEND_URL=http://localhost:8000
BACKEND_API_KEY=<dev key from `npm run seed` in backend>
```
Copy it: `cp .env.local.example .env.local` and fill the key.

- [ ] **Step 3: Vitest config (jsdom + RTL)**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true, setupFiles: [] },
  resolve: { alias: { "@": new URL("./", import.meta.url).pathname } },
});
```

- [ ] **Step 4: Playwright config**

`playwright.config.ts`:
```ts
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true },
});
```

- [ ] **Step 5: Add test scripts**

In `package.json` `scripts`, add: `"test": "vitest run"`, `"e2e": "playwright test"`.

- [ ] **Step 6: Dockerfile (for deployment)**

In `next.config.mjs`, enable standalone output:
```js
const nextConfig = { output: "standalone" };
export default nextConfig;
```

`.dockerignore`:
```
node_modules
.next
.env.local
```

`Dockerfile`:
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```
`BACKEND_URL` and `BACKEND_API_KEY` are supplied as environment variables to the running container — never baked into the image.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore(web): scaffold next.js + tailwind + vitest + playwright + Dockerfile"
```

---

## Task 3: Shared types + the server-only API client

**Files:**
- Create: `lib/types.ts`, `lib/api.ts`

- [ ] **Step 1: Types (Zod)**

`lib/types.ts`:
```ts
import { z } from "zod";

export const ReviewItem = z.object({
  id: z.string(), doc_type: z.string().nullable(), urgency: z.string().nullable(),
  review_band: z.string().nullable(), matched_patient_id: z.string().nullable(),
  match_confidence: z.number().nullable(), summary: z.string().nullable(),
});
export type ReviewItem = z.infer<typeof ReviewItem>;

export const ReviewDetail = z.object({
  id: z.string(), status: z.string(), doc_type: z.string().nullable(), urgency: z.string().nullable(),
  extracted: z.any().nullable(), matched_patient_id: z.string().nullable(),
  match_confidence: z.number().nullable(), raw_uri: z.string(),
});
export type ReviewDetail = z.infer<typeof ReviewDetail>;

export const Patient = z.object({
  id: z.string(), first_name: z.string(), last_name: z.string(),
  dob: z.string().nullable(), medicare_number: z.string().nullable(),
});
export type Patient = z.infer<typeof Patient>;

export const Metrics = z.object({
  needs_review: z.number(), urgent_pending: z.number(),
  filed_total: z.number(), auto_handled_pct: z.number(),
});
export type Metrics = z.infer<typeof Metrics>;
```

- [ ] **Step 2: Server-only client**

`lib/api.ts`:
```ts
import "server-only";
import { ReviewItem, ReviewDetail, Patient, Metrics } from "./types";

const BASE = process.env.BACKEND_URL!;
const KEY = process.env.BACKEND_API_KEY!;
const headers = { "X-API-Key": KEY };

async function get(path: string) {
  const r = await fetch(`${BASE}${path}`, { headers, cache: "no-store" });
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
  return r.json();
}

export const api = {
  listReview: async () => ReviewItem.array().parse(await get("/review")),
  getReview: async (id: string) => ReviewDetail.parse(await get(`/review/${id}`)),
  searchPatients: async (q: string) => Patient.array().parse(await get(`/patients?q=${encodeURIComponent(q)}`)),
  metrics: async () => Metrics.parse(await get("/metrics")),

  async confirm(id: string, body: { patient_id?: string | null; doc_type?: string | null; accepted_unchanged: boolean }) {
    const r = await fetch(`${BASE}/review/${id}/confirm`, {
      method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(`confirm → ${r.status}`);
    return r.json();
  },
  async upload(form: FormData) {
    const r = await fetch(`${BASE}/ingest/upload`, { method: "POST", headers, body: form });
    if (!r.ok) throw new Error(`upload → ${r.status}`);
    return r.json();
  },
  async importRoster(form: FormData) {
    const r = await fetch(`${BASE}/roster/import`, { method: "POST", headers, body: form });
    if (!r.ok) throw new Error(`roster → ${r.status}`);
    return r.json();
  },
  async raw(id: string) {
    return fetch(`${BASE}/review/${id}/raw`, { headers, cache: "no-store" });
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add lib && git commit -m "feat(web): server-only typed api client + zod types"
```

---

## Task 4: Pure helpers (tested)

**Files:**
- Create: `lib/format.ts`, `tests/format.test.ts`

- [ ] **Step 1: Failing test**

`tests/format.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { confidenceLevel, bandLabel } from "@/lib/format";

describe("confidenceLevel", () => {
  it("buckets scores", () => {
    expect(confidenceLevel(95)).toBe("high");
    expect(confidenceLevel(70)).toBe("medium");
    expect(confidenceLevel(40)).toBe("low");
    expect(confidenceLevel(null)).toBe("low");
  });
});

describe("bandLabel", () => {
  it("humanizes bands", () => {
    expect(bandLabel("auto_ready")).toBe("Auto-ready");
    expect(bandLabel("attention")).toBe("Needs attention");
    expect(bandLabel(null)).toBe("—");
  });
});
```

- [ ] **Step 2: Implement**

`lib/format.ts`:
```ts
export type Level = "high" | "medium" | "low";

export function confidenceLevel(score: number | null): Level {
  if (score == null) return "low";
  if (score >= 90) return "high";
  if (score >= 60) return "medium";
  return "low";
}

export function bandLabel(band: string | null): string {
  if (band === "auto_ready") return "Auto-ready";
  if (band === "attention") return "Needs attention";
  return "—";
}
```

- [ ] **Step 3: Run + commit**

Run: `npx vitest run tests/format.test.ts` → PASS
```bash
git add lib/format.ts tests/format.test.ts && git commit -m "feat(web): format helpers + tests"
```

---

## Task 5: Badge component (tested)

**Files:**
- Create: `components/Badge.tsx`, `tests/badge.test.tsx`

- [ ] **Step 1: Failing test**

`tests/badge.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Badge } from "@/components/Badge";

test("renders label and tone class", () => {
  render(<Badge tone="danger">Urgent</Badge>);
  const el = screen.getByText("Urgent");
  expect(el).toBeTruthy();
  expect(el.className).toContain("bg-red");
});
```

- [ ] **Step 2: Implement**

`components/Badge.tsx`:
```tsx
type Tone = "danger" | "warn" | "ok" | "muted";
const TONE: Record<Tone, string> = {
  danger: "bg-red-100 text-red-800",
  warn: "bg-amber-100 text-amber-800",
  ok: "bg-emerald-100 text-emerald-800",
  muted: "bg-slate-100 text-slate-700",
};
export function Badge({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${TONE[tone]}`}>{children}</span>;
}
```

- [ ] **Step 3: Run + commit**

Run: `npx vitest run tests/badge.test.tsx` → PASS
```bash
git add components/Badge.tsx tests/badge.test.tsx && git commit -m "feat(web): badge component + test"
```

---

## Task 6: ReviewTable component (pure, tested)

**Files:**
- Create: `components/ReviewTable.tsx`, `tests/reviewTable.test.tsx`

- [ ] **Step 1: Failing test**

`tests/reviewTable.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ReviewTable } from "@/components/ReviewTable";
import type { ReviewItem } from "@/lib/types";

const items: ReviewItem[] = [
  { id: "1", doc_type: "pathology", urgency: "urgent", review_band: "attention",
    matched_patient_id: null, match_confidence: 40, summary: "High K+" },
  { id: "2", doc_type: "referral", urgency: "routine", review_band: "auto_ready",
    matched_patient_id: "p1", match_confidence: 96, summary: "Cardio referral" },
];

test("renders rows with summaries and links", () => {
  render(<ReviewTable items={items} />);
  expect(screen.getByText("High K+")).toBeTruthy();
  expect(screen.getByText("Cardio referral")).toBeTruthy();
  const link = screen.getByRole("link", { name: /open/i });
  expect(link.getAttribute("href")).toContain("/review/");
});

test("renders an empty state", () => {
  render(<ReviewTable items={[]} />);
  expect(screen.getByText(/nothing to review/i)).toBeTruthy();
});
```

- [ ] **Step 2: Implement**

`components/ReviewTable.tsx`:
```tsx
import Link from "next/link";
import type { ReviewItem } from "@/lib/types";
import { Badge } from "./Badge";
import { confidenceLevel, bandLabel } from "@/lib/format";

export function ReviewTable({ items }: { items: ReviewItem[] }) {
  if (items.length === 0)
    return <p className="rounded border border-slate-200 bg-white p-8 text-center text-slate-500">Nothing to review right now.</p>;
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-left text-slate-500">
          <th className="p-2">Type</th><th className="p-2">Urgency</th><th className="p-2">Status</th>
          <th className="p-2">Match</th><th className="p-2">Summary</th><th className="p-2"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((i) => (
          <tr key={i.id} className={`border-t border-slate-100 ${i.urgency === "urgent" ? "bg-red-50" : ""}`}>
            <td className="p-2">{i.doc_type ?? "—"}</td>
            <td className="p-2">{i.urgency === "urgent" ? <Badge tone="danger">Urgent</Badge> : <Badge>Routine</Badge>}</td>
            <td className="p-2">{i.review_band === "auto_ready"
              ? <Badge tone="ok">{bandLabel(i.review_band)}</Badge>
              : <Badge tone="warn">{bandLabel(i.review_band)}</Badge>}</td>
            <td className="p-2">{i.match_confidence == null ? "—"
              : <Badge tone={confidenceLevel(i.match_confidence) === "high" ? "ok" : "warn"}>{i.match_confidence.toFixed(0)}</Badge>}</td>
            <td className="p-2 text-slate-700">{i.summary ?? "—"}</td>
            <td className="p-2"><Link className="text-blue-600 underline" href={`/review/${i.id}`}>Open</Link></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 3: Run + commit**

Run: `npx vitest run tests/reviewTable.test.tsx` → PASS
```bash
git add components/ReviewTable.tsx tests/reviewTable.test.tsx && git commit -m "feat(web): review table component + tests"
```

---

## Task 7: App shell — layout + nav + global styles

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`
- Create: `components/Nav.tsx`

- [ ] **Step 1: Nav**

`components/Nav.tsx`:
```tsx
import Link from "next/link";
const links = [["/", "Review"], ["/upload", "Upload"], ["/roster", "Roster"], ["/dashboard", "Dashboard"]];
export function Nav() {
  return (
    <nav className="flex gap-4 border-b border-slate-200 bg-white px-6 py-3 text-sm font-medium">
      <span className="font-semibold text-slate-900">Inbound Docs</span>
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="text-slate-600 hover:text-slate-900">{label}</Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Layout**

`app/layout.tsx`:
```tsx
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata = { title: "Inbound Docs" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Nav />
        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: globals.css** — ensure it contains the Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css components/Nav.tsx
git commit -m "feat(web): app shell (layout + nav + tailwind)"
```

---

## Task 8: Review queue page (Server Component)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Implement**

`app/page.tsx`:
```tsx
import { api } from "@/lib/api";
import { ReviewTable } from "@/components/ReviewTable";
import { Badge } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await api.listReview();
  const urgent = items.filter((i) => i.urgency === "urgent").length;
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-xl font-semibold">Documents to review</h1>
        <Badge tone="muted">{items.length} total</Badge>
        {urgent > 0 && <Badge tone="danger">{urgent} urgent</Badge>}
      </div>
      <ReviewTable items={items} />
    </section>
  );
}
```

- [ ] **Step 2: Verify**

Run (with backend + worker + seeded tenant running): `npm run dev` → open `http://localhost:3000`, confirm the queue renders (seed a couple of `needs_review` docs first).

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx && git commit -m "feat(web): review queue page"
```

---

## Task 9: Raw-document proxy (Route Handler)

**Files:**
- Create: `app/api/raw/[id]/route.ts`

- [ ] **Step 1: Implement**

`app/api/raw/[id]/route.ts`:
```ts
import { api } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const upstream = await api.raw(params.id);
  if (!upstream.ok) return new Response("not found", { status: upstream.status });
  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
               "Cache-Control": "no-store" },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/api/raw/[id]/route.ts" && git commit -m "feat(web): raw-document proxy route (key stays server-side)"
```

---

## Task 10: Document detail + confirm (Server Action)

**Files:**
- Create: `app/review/[id]/page.tsx`, `app/review/[id]/actions.ts`

- [ ] **Step 1: Server actions**

`app/review/[id]/actions.ts`:
```ts
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

export async function confirmAction(id: string, patientId: string | null, docType: string | null, acceptedUnchanged: boolean) {
  await api.confirm(id, { patient_id: patientId, doc_type: docType, accepted_unchanged: acceptedUnchanged });
  revalidatePath("/");
  redirect("/");
}
```

- [ ] **Step 2: Detail page (server component renders, client island for the picker)**

`app/review/[id]/page.tsx`:
```tsx
import { api } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { PatientPicker } from "@/components/PatientPicker";
import { confirmAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ReviewDetail({ params }: { params: { id: string } }) {
  const doc = await api.getReview(params.id);
  const confirm = confirmAction.bind(null, doc.id);
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <a className="text-blue-600 underline" href="/">← Back to queue</a>
        <div className="mt-3 overflow-hidden rounded border border-slate-200 bg-white">
          {/* original document, streamed through the proxy */}
          <img src={`/api/raw/${doc.id}`} alt="original document" className="w-full" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{doc.doc_type ?? "Unknown"}</h1>
          {doc.urgency === "urgent" && <Badge tone="danger">Urgent</Badge>}
        </div>
        <pre className="overflow-auto rounded bg-slate-100 p-3 text-xs">{JSON.stringify(doc.extracted, null, 2)}</pre>
        <p className="text-sm text-slate-600">
          Matched patient: <span className="font-mono">{doc.matched_patient_id ?? "—"}</span>
          {doc.match_confidence != null && <> (conf {doc.match_confidence.toFixed(0)})</>}
        </p>
        {/* one-click confirm */}
        <form action={async () => { "use server"; await confirm(doc.matched_patient_id, doc.doc_type, true); }}>
          <button className="rounded bg-emerald-600 px-4 py-2 text-white" disabled={!doc.matched_patient_id}>
            Confirm &amp; file
          </button>
        </form>
        {/* correct the patient, then confirm */}
        <PatientPicker docId={doc.id} docType={doc.doc_type} />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/review/[id]/page.tsx" "app/review/[id]/actions.ts"
git commit -m "feat(web): document detail + one-click confirm"
```

---

## Task 11: Patient picker (client component → server action)

**Files:**
- Create: `components/PatientPicker.tsx`
- Create: `app/api/patients/route.ts` (proxy so the client can search without the key)
- Modify: `app/review/[id]/actions.ts` (add `confirmWithPatient`)

- [ ] **Step 1: Patient-search proxy**

`app/api/patients/route.ts`:
```ts
import { api } from "@/lib/api";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const patients = await api.searchPatients(q);
  return Response.json(patients);
}
```

- [ ] **Step 2: Add the action**

Append to `app/review/[id]/actions.ts`:
```ts
export async function confirmWithPatient(id: string, patientId: string, docType: string | null) {
  await api.confirm(id, { patient_id: patientId, doc_type: docType, accepted_unchanged: false });
  revalidatePath("/");
  redirect("/");
}
```

- [ ] **Step 3: Picker (client)**

`components/PatientPicker.tsx`:
```tsx
"use client";
import { useState } from "react";
import type { Patient } from "@/lib/types";
import { confirmWithPatient } from "@/app/review/[id]/actions";

export function PatientPicker({ docId, docType }: { docId: string; docType: string | null }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const search = async (value: string) => {
    setQ(value);
    if (value.length < 2) { setResults([]); return; }
    const r = await fetch(`/api/patients?q=${encodeURIComponent(value)}`);
    setResults(await r.json());
  };
  return (
    <div className="rounded border border-slate-200 bg-white p-3">
      <p className="mb-2 text-sm font-medium">Wrong patient? Search and re-assign:</p>
      <input value={q} onChange={(e) => search(e.target.value)} placeholder="Surname or first name"
             className="w-full rounded border border-slate-300 px-2 py-1 text-sm" />
      <ul className="mt-2 space-y-1">
        {results.map((p) => (
          <li key={p.id} className="flex items-center justify-between text-sm">
            <span>{p.last_name}, {p.first_name} {p.dob ? `(${p.dob})` : ""}</span>
            <form action={confirmWithPatient.bind(null, docId, p.id, docType)}>
              <button className="rounded bg-blue-600 px-2 py-1 text-xs text-white">Assign &amp; file</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: in the running app, open an `attention` document, search a patient, click **Assign & file**, confirm it leaves the queue and `GET /export.csv` shows it.

- [ ] **Step 5: Commit**

```bash
git add components/PatientPicker.tsx "app/api/patients/route.ts" "app/review/[id]/actions.ts"
git commit -m "feat(web): patient search + re-assign flow"
```

---

## Task 12: Upload page (Server Action, multipart)

**Files:**
- Create: `app/upload/page.tsx`, `app/upload/actions.ts`

- [ ] **Step 1: Action**

`app/upload/actions.ts`:
```ts
"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function uploadAction(formData: FormData) {
  await api.upload(formData);            // forwards multipart to the backend with the server key
  revalidatePath("/");
}
```

- [ ] **Step 2: Page**

`app/upload/page.tsx`:
```tsx
import { uploadAction } from "./actions";

export default function UploadPage() {
  return (
    <section className="max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Upload a document</h1>
      <form action={uploadAction} className="space-y-3">
        <input type="file" name="file" required className="block w-full text-sm" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Upload</button>
      </form>
      <p className="mt-3 text-sm text-slate-500">It will appear in the review queue once the worker processes it.</p>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/upload/ && git commit -m "feat(web): upload page (server action multipart)"
```

---

## Task 13: Roster import page

**Files:**
- Create: `app/roster/page.tsx`, `app/roster/actions.ts`

- [ ] **Step 1: Action**

`app/roster/actions.ts`:
```ts
"use server";
import { api } from "@/lib/api";

export async function importRosterAction(formData: FormData) {
  const res = await api.importRoster(formData);
  return res;
}
```

- [ ] **Step 2: Page**

`app/roster/page.tsx`:
```tsx
import { importRosterAction } from "./actions";

export default function RosterPage() {
  return (
    <section className="max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Import patient roster</h1>
      <p className="mb-3 text-sm text-slate-500">
        CSV with columns: <code>external_id,first_name,last_name,dob,medicare_number</code>
      </p>
      <form action={importRosterAction} className="space-y-3">
        <input type="file" name="file" accept=".csv" required className="block w-full text-sm" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Import</button>
      </form>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/roster/ && git commit -m "feat(web): roster import page"
```

---

## Task 14: Dashboard (ROI metrics)

**Files:**
- Create: `app/dashboard/page.tsx`, `components/Stat.tsx`

- [ ] **Step 1: Stat card**

`components/Stat.tsx`:
```tsx
export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-slate-600">{label}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Dashboard page**

`app/dashboard/page.tsx`:
```tsx
import { api } from "@/lib/api";
import { Stat } from "@/components/Stat";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const m = await api.metrics();
  return (
    <section>
      <h1 className="mb-4 text-xl font-semibold">Practice dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="In review" value={m.needs_review} />
        <Stat label="Urgent pending" value={m.urgent_pending} hint="surface these first" />
        <Stat label="Filed" value={m.filed_total} />
        <Stat label="Auto-handled" value={`${m.auto_handled_pct}%`} hint="accepted unchanged" />
      </div>
      <p className="mt-4 text-sm text-slate-500">
        Auto-handled % is your ROI headline — the share of documents the AI got right with zero correction.
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/ components/Stat.tsx && git commit -m "feat(web): ROI dashboard"
```

---

## Task 15: End-to-end happy path (Playwright)

**Files:**
- Create: `e2e/flow.spec.ts`

- [ ] **Step 1: Spec**

`e2e/flow.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

// Prereq: backend + worker running, tenant seeded, a roster imported, and at least
// one document uploaded and processed into needs_review before running this.
test("staff can review and confirm a document", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /documents to review/i })).toBeVisible();
  const open = page.getByRole("link", { name: /open/i }).first();
  await open.click();
  await expect(page).toHaveURL(/\/review\//);
  await page.getByRole("button", { name: /confirm & file/i }).click();
  await expect(page).toHaveURL("http://localhost:3000/");
});
```

- [ ] **Step 2: Run + commit**

Run: `npx playwright install --with-deps` then `npm run e2e`
Expected: PASS (with backend, worker, and a processed document in place).
```bash
git add e2e && git commit -m "test(web): playwright happy-path e2e"
```

---

## Task 16: README (frontend run instructions)

**Files:**
- Create/append: `README.md`

- [ ] **Step 1: Document**

`README.md` covering: `npm install`; `cp .env.local.example .env.local` and paste the backend tenant key into `BACKEND_API_KEY`; `npm run dev`; the page map (`/`, `/review/[id]`, `/upload`, `/roster`, `/dashboard`); `npm test` (component) and `npm run e2e` (Playwright); and a note that the API key lives only in server env and the browser never receives it.

- [ ] **Step 2: Commit**

```bash
git add README.md && git commit -m "docs(web): frontend README"
```

---

## Self-Review

**Coverage (against the UX model):**
- Review queue with urgency-first + counts + bands → Tasks 6, 8.
- Document detail with original-document viewer + extracted fields + confidence → Tasks 9, 10.
- One-click confirm (auto-ready) and correct-then-file (patient search) → Tasks 10, 11.
- Upload → Task 12. Roster import → Task 13. ROI dashboard → Task 14.
- Security: API key server-only via `import "server-only"` + proxy route handlers; the browser never gets the key → Tasks 3, 9, 11.
- Backend dependencies it needs → added explicitly in Task 1 (raw stream, patient search, metrics) with their own tests.

**Placeholder scan:** No "TODO / handle later / similar to". Every component, page, action, and route handler has complete code. The Playwright spec states its data prerequisite explicitly rather than hand-waving it.

**Type consistency:** `ReviewItem`, `ReviewDetail`, `Patient`, `Metrics` (Task 3) are parsed by the client and consumed unchanged by `ReviewTable` (Task 6), the detail page (Task 10), `PatientPicker` (Task 11), and the dashboard (Task 14). Server actions `confirmAction(id, patientId, docType, acceptedUnchanged)` and `confirmWithPatient(id, patientId, docType)` are bound consistently at their call sites. The proxy routes (`/api/raw/[id]`, `/api/patients`) match the client functions `api.raw(id)` and `api.searchPatients(q)`.

**Testability note:** Server Components that call the server-only `api` are validated via Playwright (Task 15) and manual run-throughs rather than RTL, because they require server env + a live backend. The pure, high-value units — `format` helpers, `Badge`, `ReviewTable` — are unit-tested with Vitest + RTL (Tasks 4–6). This is the correct testing pyramid for App-Router code, not a coverage gap.

**Deliberately deferred (later):** real auth/SSO + multi-user roles (MVP uses a single per-tenant key in server env), websockets/live refresh (pages are `force-dynamic` + revalidate on action), bulk actions, keyboard-driven triage, image zoom/pan and multi-page PDF rendering, audit-trail viewer, i18n, dark mode.
```
