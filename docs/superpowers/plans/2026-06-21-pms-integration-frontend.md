# PMS Integration (Frontend) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the three client surfaces for PMS integration — a public tiered supported-PMS catalog page, a request-a-PMS lead form, and an authenticated "Connect your PMS" settings page (API-key form OR OAuth button per the PMS's auth kind) with a write-back health panel.

**Architecture:** Next.js 16 App Router with React Server Components + server actions, mirroring the existing channels feature (`app/(main)/channels/`). Server-side data access goes through `lib/api.ts` (authed) and `lib/publicApi` (no auth); zod schemas in `lib/types.ts` validate every response. The catalog and request form are public (reachable pre-login); the connect surface lives under `app/(main)/` and requires a session.

**Tech Stack:** Next.js 16, React 19, server actions, zod 4, Tailwind v4, vitest + Testing Library, Playwright.

Depends on the backend plan `clinidoc-api/docs/superpowers/plans/2026-06-21-pms-integration-backend.md` being implemented (endpoints under `/pms`). Reference design: `clinidoc-api/docs/superpowers/specs/2026-06-21-pms-integration-design.md`.

---

## Conventions for this plan

- Components live in `components/`; pages in `app/`. Follow the existing channels feature for structure (`page.tsx` server component + `actions.ts` server actions + small client components).
- Unit tests are `tests/<name>.test.tsx` (vitest, jsdom). Run with `npm test`. Run one: `npx vitest run tests/<name>.test.tsx`.
- E2E is Playwright in `e2e/`. Run with `npm run e2e`.
- The backend base URL is `process.env.BACKEND_URL` (already used by `lib/api.ts`).

---

### Task 1: Types for catalog, connection, request, stuck docs

**Files:**
- Modify: `lib/types.ts`
- Test: `tests/pmsTypes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/pmsTypes.test.ts
import { describe, it, expect } from "vitest";
import { PmsCatalogEntry, PmsConnectionStatus, StuckDoc } from "../lib/types";

describe("PMS types", () => {
  it("parses a catalog entry", () => {
    const e = PmsCatalogEntry.parse({ key: "cliniko", display_name: "Cliniko", segment: "allied",
      hosting: "cloud", tier: "write_back", capabilities: ["roster.read", "document.write"], status: "beta" });
    expect(e.tier).toBe("write_back");
  });
  it("parses a not-connected status", () => {
    expect(PmsConnectionStatus.parse({ connected: false }).connected).toBe(false);
  });
  it("parses a connected status", () => {
    const s = PmsConnectionStatus.parse({ connected: true, pmsType: "cliniko", authKind: "api_key",
      status: "connected", capabilities: ["document.write"], lastRosterSyncAt: null, lastError: null });
    expect(s.pmsType).toBe("cliniko");
  });
  it("parses a stuck doc", () => {
    const d = StuckDoc.parse({ id: "1", doc_type: "pathology", write_back_status: "failed",
      write_back_attempts: 2, write_back_error: "boom", updated_at: "2026-06-21T00:00:00Z" });
    expect(d.write_back_status).toBe("failed");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/pmsTypes.test.ts`
Expected: FAIL — exports not found.

- [ ] **Step 3: Add the schemas to `lib/types.ts`** (append, mirroring existing zod style)

```ts
export const PmsCatalogEntry = z.object({
  key: z.string(),
  display_name: z.string(),
  segment: z.string(),
  hosting: z.string(),
  tier: z.enum(["write_back", "roster", "export_only"]),
  capabilities: z.array(z.string()),
  status: z.enum(["live", "beta", "planned"]),
});
export type PmsCatalogEntry = z.infer<typeof PmsCatalogEntry>;

export const PmsConnectionStatus = z.union([
  z.object({ connected: z.literal(false) }),
  z.object({
    connected: z.literal(true),
    pmsType: z.string(),
    authKind: z.enum(["api_key", "oauth2"]),
    status: z.string(),
    capabilities: z.array(z.string()),
    lastRosterSyncAt: z.string().nullable(),
    lastError: z.string().nullable(),
  }),
]);
export type PmsConnectionStatus = z.infer<typeof PmsConnectionStatus>;

export const StuckDoc = z.object({
  id: z.string(),
  doc_type: z.string().nullable(),
  write_back_status: z.string(),
  write_back_attempts: z.number(),
  write_back_error: z.string().nullable(),
  updated_at: z.string(),
});
export type StuckDoc = z.infer<typeof StuckDoc>;
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/pmsTypes.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/types.ts tests/pmsTypes.test.ts
git commit -m "feat(web): PMS zod types (catalog, connection, stuck doc)"
```

---

### Task 2: API client methods

**Files:**
- Modify: `lib/api.ts`
- Test: none (thin wrappers; covered by page/e2e tests)

- [ ] **Step 1: Add authed methods to the `api` object in `lib/api.ts`**

```ts
  pmsConnection:  async () => PmsConnectionStatus.parse(await get("/pms/connection")),
  pmsConnectApiKey: (pms_type: string, api_key: string) => post("/pms/connection", { pms_type, api_key }),
  pmsAuthorizeUrl: async (pms_type: string) =>
                    get(`/pms/connection/authorize?pms_type=${encodeURIComponent(pms_type)}`) as Promise<{ url: string; state: string }>,
  pmsDisconnect:  async () => fetch(`${BASE}/pms/connection`, { method: "DELETE", headers: await authHeaders() }).then(r => r.json()),
  pmsSync:        () => post("/pms/connection/sync") as Promise<{ synced: number }>,
  pmsStuck:       async () => StuckDoc.array().parse(await get("/pms/writeback/stuck")),
```

Add the imports to the top-of-file type import list:

```ts
import { /* ...existing... */ PmsConnectionStatus, StuckDoc } from "./types";
```

- [ ] **Step 2: Add public (no-auth) methods to the `publicApi` object**

```ts
  async pmsCatalog() {
    const r = await fetch(`${BASE}/pms/catalog`, { cache: "no-store" });
    if (!r.ok) throw new Error("catalog unavailable");
    return PmsCatalogEntry.array().parse(await r.json());
  },
  async submitPmsRequest(input: { pms_name: string; clinic_name?: string; clinic_size?: string; segment?: string; contact_email: string; note?: string }) {
    const r = await fetch(`${BASE}/pms/requests`, { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<{ id: string; status: string }>;
  },
```

Add `PmsCatalogEntry` to the type import list as well.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/api.ts
git commit -m "feat(web): api client for PMS catalog, requests, connection"
```

---

### Task 3: Catalog tier helper + Badge reuse

**Files:**
- Create: `lib/pms.ts`
- Test: `tests/pmsTier.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { tierLabel, tierTone, statusTone, capabilityLabel } from "../lib/pms";

describe("pms tier helpers", () => {
  it("labels tiers human-readably", () => {
    expect(tierLabel("write_back")).toBe("Auto-file into PMS");
    expect(tierLabel("roster")).toBe("Roster sync only");
    expect(tierLabel("export_only")).toBe("Export mode (any PMS)");
  });
  it("maps tier to a tone", () => {
    expect(tierTone("write_back")).toBe("green");
    expect(tierTone("export_only")).toBe("gray");
  });
  it("maps status to a tone", () => {
    expect(statusTone("live")).toBe("green");
    expect(statusTone("beta")).toBe("amber");
    expect(statusTone("planned")).toBe("gray");
  });
  it("labels a capability", () => {
    expect(capabilityLabel("document.write")).toBe("Files documents");
    expect(capabilityLabel("roster.read")).toBe("Syncs patient roster");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/pmsTier.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/pms.ts`**

```ts
export type Tone = "green" | "amber" | "gray";

export function tierLabel(tier: string): string {
  return tier === "write_back" ? "Auto-file into PMS"
    : tier === "roster" ? "Roster sync only"
    : "Export mode (any PMS)";
}
export function tierTone(tier: string): Tone {
  return tier === "write_back" ? "green" : tier === "roster" ? "amber" : "gray";
}
export function statusTone(status: string): Tone {
  return status === "live" ? "green" : status === "beta" ? "amber" : "gray";
}
export function capabilityLabel(cap: string): string {
  const map: Record<string, string> = {
    "roster.read": "Syncs patient roster",
    "patient.search": "Live patient lookup",
    "document.write": "Files documents",
    "task.create": "Creates provider tasks",
    "result.acknowledge": "Acknowledges results",
  };
  return map[cap] ?? cap;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/pmsTier.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/pms.ts tests/pmsTier.test.ts
git commit -m "feat(web): PMS tier/status/capability label helpers"
```

---

### Task 4: PmsCard component (one catalog entry)

**Files:**
- Create: `components/PmsCard.tsx`
- Test: `tests/pmsCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PmsCard } from "../components/PmsCard";

const entry = { key: "cliniko", display_name: "Cliniko", segment: "allied", hosting: "cloud",
  tier: "write_back" as const, capabilities: ["roster.read", "document.write"], status: "beta" as const };

describe("PmsCard", () => {
  it("shows the name, tier label, status, and capabilities", () => {
    render(<PmsCard entry={entry} />);
    expect(screen.getByText("Cliniko")).toBeInTheDocument();
    expect(screen.getByText("Auto-file into PMS")).toBeInTheDocument();
    expect(screen.getByText(/beta/i)).toBeInTheDocument();
    expect(screen.getByText("Files documents")).toBeInTheDocument();
    expect(screen.getByText("Syncs patient roster")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/pmsCard.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/PmsCard.tsx`** (reuse the existing `Badge` component)

```tsx
import { Badge } from "./Badge";
import { PmsCatalogEntry } from "../lib/types";
import { tierLabel, tierTone, statusTone, capabilityLabel } from "../lib/pms";

export function PmsCard({ entry }: { entry: PmsCatalogEntry }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{entry.display_name}</h3>
        <Badge tone={statusTone(entry.status)}>{entry.status}</Badge>
      </div>
      <Badge tone={tierTone(entry.tier)}>{tierLabel(entry.tier)}</Badge>
      {entry.capabilities.length > 0 && (
        <ul className="text-sm text-gray-600 list-disc pl-5">
          {entry.capabilities.map((c) => <li key={c}>{capabilityLabel(c)}</li>)}
        </ul>
      )}
      <p className="text-xs text-gray-400 mt-auto">{entry.segment} · {entry.hosting}</p>
    </div>
  );
}
```

If `Badge` does not accept a `tone` prop, check `components/Badge.tsx` and adapt — the existing `tests/badge.test.tsx` documents its API. If it only accepts `children` + `className`, pass tone-derived classes instead.

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/pmsCard.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add components/PmsCard.tsx tests/pmsCard.test.tsx
git commit -m "feat(web): PmsCard catalog component"
```

---

### Task 5: Public supported-PMS catalog page

**Files:**
- Create: `app/integrations/page.tsx` (public route, outside the auth group)
- Test: covered by the e2e flow in Task 9

- [ ] **Step 1: Implement `app/integrations/page.tsx`**

```tsx
import { publicApi } from "../../lib/api";
import { PmsCard } from "../../components/PmsCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const catalog = await publicApi.pmsCatalog();
  const writeBack = catalog.filter((c) => c.tier === "write_back");
  const roster = catalog.filter((c) => c.tier === "roster");
  const exportOnly = catalog.filter((c) => c.tier === "export_only");

  return (
    <main className="max-w-4xl mx-auto p-8 flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold">Supported practice software</h1>
        <p className="text-gray-600 mt-1">
          We work with every clinic. Connected PMSes get documents filed automatically — and if yours
          isn&apos;t here yet, you can start today in export mode and we&apos;ll notify you when it&apos;s live.
        </p>
      </header>

      {writeBack.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Auto-file into your PMS</h2>
          <div className="grid sm:grid-cols-2 gap-4">{writeBack.map((e) => <PmsCard key={e.key} entry={e} />)}</div>
        </section>
      )}
      {roster.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Roster sync</h2>
          <div className="grid sm:grid-cols-2 gap-4">{roster.map((e) => <PmsCard key={e.key} entry={e} />)}</div>
        </section>
      )}
      <section>
        <h2 className="font-semibold mb-2">Works with any PMS</h2>
        <div className="grid sm:grid-cols-2 gap-4">{exportOnly.map((e) => <PmsCard key={e.key} entry={e} />)}</div>
      </section>

      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 flex items-center justify-between">
        <p className="text-sm">Don&apos;t see your PMS?</p>
        <Link href="/integrations/request" className="text-sm font-medium text-blue-600 underline">Request it →</Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: build succeeds; `/integrations` appears in the route list.

- [ ] **Step 3: Commit**

```bash
git add app/integrations/page.tsx
git commit -m "feat(web): public supported-PMS catalog page"
```

---

### Task 6: Request-a-PMS form + server action

**Files:**
- Create: `app/integrations/request/page.tsx`
- Create: `app/integrations/request/actions.ts`
- Create: `app/integrations/request/RequestForm.tsx` (client component)
- Test: `tests/requestForm.test.tsx`

- [ ] **Step 1: Write the failing test for the form's client-side validation**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RequestForm } from "../app/integrations/request/RequestForm";

describe("RequestForm", () => {
  it("disables submit until PMS name and email are present", () => {
    render(<RequestForm action={vi.fn()} />);
    const submit = screen.getByRole("button", { name: /request/i }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/PMS name/i), { target: { value: "Zedmed" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "a@b.test" } });
    expect(submit.disabled).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/requestForm.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `app/integrations/request/RequestForm.tsx`**

```tsx
"use client";
import { useState } from "react";

export function RequestForm({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  const [pmsName, setPmsName] = useState("");
  const [email, setEmail] = useState("");
  const ready = pmsName.trim().length > 0 && /.+@.+\..+/.test(email);

  return (
    <form action={action} className="flex flex-col gap-3 max-w-md">
      <label className="flex flex-col gap-1 text-sm">PMS name
        <input name="pms_name" aria-label="PMS name" value={pmsName} onChange={(e) => setPmsName(e.target.value)}
          className="border rounded px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Clinic name (optional)
        <input name="clinic_name" className="border rounded px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Your email
        <input name="contact_email" aria-label="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Anything else (optional)
        <textarea name="note" className="border rounded px-2 py-1" />
      </label>
      <button type="submit" disabled={!ready}
        className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-40">Request this PMS</button>
    </form>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/requestForm.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Implement the server action `app/integrations/request/actions.ts`**

```ts
"use server";
import { redirect } from "next/navigation";
import { publicApi } from "../../../lib/api";

export async function submitRequest(formData: FormData) {
  await publicApi.submitPmsRequest({
    pms_name: String(formData.get("pms_name") ?? ""),
    clinic_name: (formData.get("clinic_name") as string) || undefined,
    contact_email: String(formData.get("contact_email") ?? ""),
    note: (formData.get("note") as string) || undefined,
  });
  redirect("/integrations/request?submitted=1");
}
```

- [ ] **Step 6: Implement the page `app/integrations/request/page.tsx`**

```tsx
import { RequestForm } from "./RequestForm";
import { submitRequest } from "./actions";

export default async function RequestPage({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const { submitted } = await searchParams;
  return (
    <main className="max-w-2xl mx-auto p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Request a PMS integration</h1>
      {submitted ? (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="font-medium">Thanks — we&apos;ve logged your request.</p>
          <p className="text-sm text-gray-600 mt-1">
            You can start using us today in export mode, and we&apos;ll email you the moment this PMS is live.
          </p>
        </div>
      ) : (
        <>
          <p className="text-gray-600">Tell us which PMS your clinic uses. This directly shapes what we build next.</p>
          <RequestForm action={submitRequest} />
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 7: Verify build + commit**

Run: `npm run build`
Expected: build succeeds.

```bash
git add app/integrations/request tests/requestForm.test.tsx
git commit -m "feat(web): request-a-PMS form + server action"
```

---

### Task 7: Connect-your-PMS settings page + actions

**Files:**
- Create: `app/(main)/integrations/page.tsx`
- Create: `app/(main)/integrations/actions.ts`
- Create: `app/(main)/integrations/ConnectForm.tsx` (client)
- Test: `tests/connectForm.test.tsx`

- [ ] **Step 1: Write the failing test for auth-kind branching**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectForm } from "../app/(main)/integrations/ConnectForm";

const catalog = [
  { key: "cliniko", display_name: "Cliniko", authKind: "api_key" },
  { key: "halaxy", display_name: "Halaxy", authKind: "oauth2" },
];

describe("ConnectForm", () => {
  it("shows an API-key field when an api_key PMS is selected", () => {
    render(<ConnectForm options={catalog} connectApiKey={vi.fn()} beginOAuth={vi.fn()} selected="cliniko" />);
    expect(screen.getByLabelText(/API key/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /connect with halaxy/i })).not.toBeInTheDocument();
  });
  it("shows an OAuth button when an oauth2 PMS is selected", () => {
    render(<ConnectForm options={catalog} connectApiKey={vi.fn()} beginOAuth={vi.fn()} selected="halaxy" />);
    expect(screen.queryByLabelText(/API key/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /connect/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/connectForm.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `app/(main)/integrations/ConnectForm.tsx`**

```tsx
"use client";
import { useState } from "react";

type Option = { key: string; display_name: string; authKind: "api_key" | "oauth2" };

export function ConnectForm({ options, connectApiKey, beginOAuth, selected: initial }: {
  options: Option[];
  connectApiKey: (formData: FormData) => void | Promise<void>;
  beginOAuth: (pmsType: string) => void | Promise<void>;
  selected?: string;
}) {
  const [selected, setSelected] = useState(initial ?? options[0]?.key ?? "");
  const opt = options.find((o) => o.key === selected);

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <label className="flex flex-col gap-1 text-sm">Practice software
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="border rounded px-2 py-1">
          {options.map((o) => <option key={o.key} value={o.key}>{o.display_name}</option>)}
        </select>
      </label>

      {opt?.authKind === "api_key" && (
        <form action={connectApiKey} className="flex flex-col gap-2">
          <input type="hidden" name="pms_type" value={selected} />
          <label className="flex flex-col gap-1 text-sm">API key
            <input name="api_key" aria-label="API key" className="border rounded px-2 py-1" />
          </label>
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Connect</button>
        </form>
      )}

      {opt?.authKind === "oauth2" && (
        <button onClick={() => beginOAuth(selected)} className="bg-blue-600 text-white rounded px-4 py-2">
          Connect with {opt.display_name}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/connectForm.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Implement `app/(main)/integrations/actions.ts`**

```ts
"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api } from "../../../lib/api";

export async function connectApiKey(formData: FormData) {
  await api.pmsConnectApiKey(String(formData.get("pms_type") ?? ""), String(formData.get("api_key") ?? ""));
  revalidatePath("/integrations");
}
export async function beginOAuth(pmsType: string) {
  const { url } = await api.pmsAuthorizeUrl(pmsType);
  redirect(url); // hands the browser to the PMS; callback redirects back to /integrations?connected=1
}
export async function disconnect() {
  await api.pmsDisconnect();
  revalidatePath("/integrations");
}
export async function syncRoster() {
  await api.pmsSync();
  revalidatePath("/integrations");
}
```

- [ ] **Step 6: Implement the page `app/(main)/integrations/page.tsx`**

```tsx
import { requireSession } from "../../../lib/auth";
import { api, publicApi } from "../../../lib/api";
import { ConnectForm } from "./ConnectForm";
import { connectApiKey, beginOAuth, disconnect, syncRoster } from "./actions";

export const dynamic = "force-dynamic";

export default async function IntegrationsSettingsPage() {
  const session = await requireSession();
  const [status, catalog, stuck] = await Promise.all([
    api.pmsConnection(),
    publicApi.pmsCatalog(),
    api.pmsStuck().catch(() => []),
  ]);
  const canManage = session.role === "owner" || session.role === "admin";

  // Connectable options = catalog entries with a write_back/roster tier (export_only is not "connectable").
  // authKind is known from the catalog key; the backend rejects a wrong kind, but we branch UX here.
  const authKindFor = (key: string): "api_key" | "oauth2" => (key === "halaxy" ? "oauth2" : "api_key");
  const options = catalog.filter((c) => c.tier !== "export_only")
    .map((c) => ({ key: c.key, display_name: c.display_name, authKind: authKindFor(c.key) }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Connect your PMS</h1>

      {status.connected ? (
        <section className="rounded-lg border border-gray-200 p-4 flex flex-col gap-2">
          <p><span className="font-medium">{status.pmsType}</span> — {status.status}</p>
          <p className="text-sm text-gray-500">
            Last roster sync: {status.lastRosterSyncAt ? new Date(status.lastRosterSyncAt).toLocaleString() : "never"}
          </p>
          {status.lastError && <p className="text-sm text-red-600">{status.lastError}</p>}
          {canManage && (
            <div className="flex gap-2">
              <form action={syncRoster}><button className="border rounded px-3 py-1 text-sm">Sync roster now</button></form>
              <form action={disconnect}><button className="border rounded px-3 py-1 text-sm text-red-600">Disconnect</button></form>
            </div>
          )}
        </section>
      ) : (
        canManage
          ? <ConnectForm options={options} connectApiKey={connectApiKey} beginOAuth={beginOAuth} />
          : <p className="text-gray-600">No PMS connected. Ask an owner or admin to connect one.</p>
      )}

      <section>
        <h2 className="font-semibold mb-2">Write-back health</h2>
        {stuck.length === 0 ? (
          <p className="text-sm text-gray-500">All confirmed documents have been filed to the PMS.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead><tr className="text-left text-gray-500">
              <th className="py-1">Document</th><th>Status</th><th>Attempts</th><th>Error</th></tr></thead>
            <tbody>
              {stuck.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="py-1">{d.doc_type ?? d.id}</td>
                  <td>{d.write_back_status}</td>
                  <td>{d.write_back_attempts}</td>
                  <td className="text-red-600">{d.write_back_error ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: build succeeds; `/integrations` (authed) renders inside the `(main)` layout.

- [ ] **Step 8: Commit**

```bash
git add "app/(main)/integrations" tests/connectForm.test.tsx
git commit -m "feat(web): connect-your-PMS settings page (api_key + oauth) + write-back health"
```

---

### Task 8: Navigation entry

**Files:**
- Modify: `components/NavLinks.tsx` (add an "Integrations" link)
- Test: none (covered by e2e)

- [ ] **Step 1: Add the link** to the authed nav, following the existing link entries (e.g. alongside "Channels"):

```tsx
{ href: "/integrations", label: "Integrations" },
```

Match the existing data shape in `NavLinks.tsx` — if links are JSX `<Link>` elements rather than an array, add:

```tsx
<NavLink href="/integrations">Integrations</NavLink>
```

- [ ] **Step 2: Verify build + commit**

Run: `npm run build`
Expected: build succeeds.

```bash
git add components/NavLinks.tsx
git commit -m "feat(web): nav link to Integrations"
```

---

### Task 9: Playwright e2e — catalog + request + connect

**Files:**
- Create: `e2e/pms.spec.ts`

- [ ] **Step 1: Write the e2e spec** (follow the structure of `e2e/flow.spec.ts` for auth setup; mock or use the test backend as that file does)

```ts
import { test, expect } from "@playwright/test";

test("public catalog lists supported PMSes and links to request", async ({ page }) => {
  await page.goto("/integrations");
  await expect(page.getByRole("heading", { name: /supported practice software/i })).toBeVisible();
  await expect(page.getByText("Cliniko")).toBeVisible();
  await expect(page.getByText(/export mode/i)).toBeVisible();
  await page.getByRole("link", { name: /request it/i }).click();
  await expect(page.getByRole("heading", { name: /request a pms integration/i })).toBeVisible();
});

test("request form submits and shows confirmation", async ({ page }) => {
  await page.goto("/integrations/request");
  await page.getByLabel(/PMS name/i).fill("Zedmed");
  await page.getByLabel(/email/i).fill("lead@clinic.test");
  await page.getByRole("button", { name: /request this pms/i }).click();
  await expect(page.getByText(/we've logged your request/i)).toBeVisible();
});
```

- [ ] **Step 2: Run the e2e suite** (requires the backend running per `playwright.config.ts`)

Run: `npm run e2e -- e2e/pms.spec.ts`
Expected: PASS (2 tests). If the project's Playwright config does not boot a backend, gate these behind the same setup `e2e/flow.spec.ts` uses.

- [ ] **Step 3: Commit**

```bash
git add e2e/pms.spec.ts
git commit -m "test(web): e2e for PMS catalog + request"
```

---

### Task 10: Full check + docs

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Run the full unit suite + build**

Run: `npm test && npm run build`
Expected: all vitest tests PASS; build succeeds.

- [ ] **Step 2: Document the three surfaces in `README.md`** — `/integrations` (public catalog), `/integrations/request` (lead form), `/integrations` under `(main)` (authed connect surface), and note the dependency on the backend `/pms` endpoints and the `BACKEND_URL` env var.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(web): PMS integration surfaces"
```

---

## Self-Review notes (already applied)

- **Spec coverage:** catalog page (T5), request form (T6), connect surface with api_key + oauth branching (T7), write-back health panel (T7), types/api (T1/T2), helpers/card (T3/T4), nav (T8), e2e (T9). Every frontend spec item maps to a task.
- **Type consistency:** `PmsCatalogEntry`, `PmsConnectionStatus`, `StuckDoc` defined once (T1) and reused; api methods `pmsConnection/pmsConnectApiKey/pmsAuthorizeUrl/pmsDisconnect/pmsSync/pmsStuck` and `publicApi.pmsCatalog/submitPmsRequest` named consistently across tasks.
- **Note on route collision:** there is a public `app/integrations/page.tsx` and an authed `app/(main)/integrations/page.tsx`. Next.js route groups `(main)` do not add a path segment, so both resolve to `/integrations`. **Resolve during T7:** rename the authed route to `app/(main)/settings/integrations/page.tsx` (path `/settings/integrations`) and point the nav link (T8) and the OAuth callback redirect (`WEB_APP_URL/settings/integrations`) at it. Keep the public marketing page at `/integrations`.
