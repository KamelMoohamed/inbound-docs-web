# PMS Adapter Expansion (Backend) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add adapters for the remaining self-serve, no-partner-gate PMSes — **Power Diary, Nookal, Coreplus, Jane** — on top of the abstraction built in the PMS integration backend plan. No new pages, no pipeline changes: each PMS is one adapter + one catalog row + contract tests, and it appears in the data-driven catalog/connect surfaces automatically.

**Architecture:** Each new adapter implements the existing `PmsAdapter` interface (`src/pms/pms-adapter.interface.ts`), is registered in `PMS_ADAPTERS` (`src/pms/pms.module.ts`), and gets a `SupportedPms` catalog row (`src/pms/catalog.ts` + reseed). Auth kind varies per vendor (API key vs OAuth2) — the abstraction already supports both. Capability sets are minimal-but-honest: only declare what the adapter actually implements.

**Tech Stack:** NestJS 10, Prisma 5, global `fetch` (mocked in tests), Jest e2e harness.

**Prerequisite:** `docs/superpowers/plans/2026-06-21-pms-integration-backend.md` is fully implemented (interface, registry, module, crypto, write-back, roster sync, catalog seed). Reference design: `docs/superpowers/specs/2026-06-21-pms-integration-design.md`.

---

## Before you start — verify vendor access models

API openness differs per vendor and must be confirmed against current docs before building each adapter. Confirm: base URL, auth model (API-key header/Basic vs OAuth2), patient-list endpoint + pagination, and the document-attach endpoint. Notes per vendor:

- **Power Diary:** API-key based; confirm header name and base URL. High confidence it's self-serve.
- **Nookal:** API-key based; confirm key placement (query vs header). High confidence it's self-serve.
- **Coreplus:** Has an integration/API program — leans "request access". If document-write is not available on a self-serve tier, ship the adapter as **`roster.read` only** (tier `roster`) rather than blocking.
- **Jane:** API access is request-gated; OAuth2 likely. If write is unavailable self-serve, ship as **`roster.read` only**.

Each task's contract test pins the request shape we depend on; the test is the spec. Where write-back isn't available, the task notes exactly what to drop.

Conventions: same as the integration backend plan — adapter unit tests `new` the class and mock `global.fetch` via `jest.spyOn(global, 'fetch')`. Run one file with `npx jest test/<file>.e2e-spec.ts`; full suite `npm test`.

---

### Task 1: Power Diary adapter (api_key)

**Files:**
- Create: `src/pms/adapters/powerdiary.adapter.ts`
- Test: `test/pms-powerdiary.e2e-spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { PowerDiaryAdapter } from '../src/pms/adapters/powerdiary.adapter';

function mockFetch(handler: (url: string, init: any) => { status: number; body: any }) {
  return jest.spyOn(global, 'fetch').mockImplementation(async (url: any, init: any) => {
    const { status, body } = handler(String(url), init);
    return { ok: status < 400, status, json: async () => body, text: async () => JSON.stringify(body) } as any;
  });
}

describe('PowerDiaryAdapter', () => {
  const a = new PowerDiaryAdapter();
  afterEach(() => jest.restoreAllMocks());

  it('declares api_key auth + capabilities', () => {
    expect(a.authKind).toBe('api_key');
    expect(a.capabilities.has('roster.read')).toBe(true);
    expect(a.capabilities.has('document.write')).toBe(true);
  });

  it('verifies the key on connect', async () => {
    mockFetch((url, init) => {
      expect(url).toBe('https://api.powerdiary.com/v1/practitioners');
      expect(init.headers.Authorization).toContain('Bearer ');
      return { status: 200, body: { data: [] } };
    });
    const init = await a.connectWithApiKey('pd-key');
    expect(init.credentials.apiKey).toBe('pd-key');
  });

  it('lists patients', async () => {
    mockFetch((url) => {
      expect(url).toContain('/clients');
      return { status: 200, body: { data: [{ id: 12, first_name: 'Jo', last_name: 'Tan', date_of_birth: '1991-03-03' }], has_more: false } };
    });
    const out: any[] = [];
    for await (const p of a.listPatients!({ apiKey: 'k' })) out.push(p);
    expect(out[0]).toEqual({ externalId: '12', firstName: 'Jo', lastName: 'Tan', dob: '1991-03-03', medicareNumber: null });
  });

  it('files a document', async () => {
    mockFetch((url, init) => {
      expect(url).toBe('https://api.powerdiary.com/v1/client_files');
      expect(init.method).toBe('POST');
      return { status: 201, body: { id: 'pdf-1' } };
    });
    const r = await a.fileDocument!({ apiKey: 'k' },
      { patientExternalId: '12', fileName: 'r.pdf', mediaType: 'application/pdf', data: Buffer.from('x'), idempotencyKey: 'h' });
    expect(r.pmsFilingId).toBe('pdf-1');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest test/pms-powerdiary.e2e-spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/pms/adapters/powerdiary.adapter.ts`**

```ts
import { Injectable } from '@nestjs/common';
import type {
  PmsAdapter, PmsCapability, ConnectionInit, PmsCredentials, PmsHealth, PmsPatient, FileRequest, FileReceipt,
} from '../pms-adapter.interface';

const BASE = 'https://api.powerdiary.com/v1';

@Injectable()
export class PowerDiaryAdapter implements PmsAdapter {
  readonly pmsType = 'powerdiary';
  readonly authKind = 'api_key' as const;
  readonly capabilities = new Set<PmsCapability>(['roster.read', 'document.write']);

  private headers(creds: PmsCredentials) {
    return { Authorization: `Bearer ${creds.apiKey}`, Accept: 'application/json' };
  }
  private async req(creds: PmsCredentials, path: string, init?: RequestInit) {
    const r = await fetch(`${BASE}${path}`, { ...init, headers: { ...this.headers(creds), ...(init?.headers ?? {}) } });
    if (!r.ok) throw new Error(`powerdiary ${path} -> ${r.status} ${await r.text()}`);
    return r.json();
  }

  async connectWithApiKey(apiKey: string): Promise<ConnectionInit> {
    const creds = { apiKey };
    await this.req(creds, '/practitioners'); // throws if invalid
    return { credentials: creds, capabilities: [...this.capabilities] };
  }
  async healthCheck(creds: PmsCredentials): Promise<PmsHealth> {
    try { await this.req(creds, '/practitioners'); return { ok: true }; }
    catch (e: any) { return { ok: false, detail: String(e?.message ?? e) }; }
  }
  async *listPatients(creds: PmsCredentials): AsyncIterable<PmsPatient> {
    let page = 1;
    for (;;) {
      const body: any = await this.req(creds, `/clients?page=${page}&per_page=100`);
      for (const p of body.data ?? []) {
        yield { externalId: String(p.id), firstName: p.first_name ?? '', lastName: p.last_name ?? '',
          dob: p.date_of_birth ?? null, medicareNumber: p.medicare_number ?? null };
      }
      if (!body.has_more) break;
      page++;
    }
  }
  async fileDocument(creds: PmsCredentials, req: FileRequest): Promise<FileReceipt> {
    const r: any = await this.req(creds, '/client_files', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': req.idempotencyKey },
      body: JSON.stringify({ client_id: req.patientExternalId, filename: req.fileName,
        content_type: req.mediaType, data: req.data.toString('base64') }) });
    return { pmsFilingId: String(r.id) };
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest test/pms-powerdiary.e2e-spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Register + catalog row**

In `src/pms/pms.module.ts`: import `PowerDiaryAdapter`, add it to `providers`, and add it to the `PMS_ADAPTERS` factory args + inject list. In `src/pms/catalog.ts` add:

```ts
  { key: 'powerdiary', displayName: 'Power Diary', segment: 'allied', hosting: 'cloud', tier: 'write_back',
    capabilities: ['roster.read', 'document.write'], status: 'beta', sortOrder: 30 },
```

- [ ] **Step 6: Reseed + commit**

```bash
npm run seed:pms
git add src/pms/adapters/powerdiary.adapter.ts src/pms/pms.module.ts src/pms/catalog.ts test/pms-powerdiary.e2e-spec.ts
git commit -m "feat(pms): Power Diary adapter (api_key)"
```

---

### Task 2: Nookal adapter (api_key)

Nookal commonly passes the API key as a request parameter; confirm exact placement and base URL during implementation. The test pins the shape.

**Files:**
- Create: `src/pms/adapters/nookal.adapter.ts`
- Test: `test/pms-nookal.e2e-spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { NookalAdapter } from '../src/pms/adapters/nookal.adapter';

function mockFetch(handler: (url: string, init: any) => { status: number; body: any }) {
  return jest.spyOn(global, 'fetch').mockImplementation(async (url: any, init: any) => {
    const { status, body } = handler(String(url), init);
    return { ok: status < 400, status, json: async () => body, text: async () => JSON.stringify(body) } as any;
  });
}

describe('NookalAdapter', () => {
  const a = new NookalAdapter();
  afterEach(() => jest.restoreAllMocks());

  it('declares api_key auth', () => {
    expect(a.authKind).toBe('api_key');
    expect(a.capabilities.has('roster.read')).toBe(true);
  });

  it('verifies the key on connect', async () => {
    mockFetch((url) => { expect(url).toContain('/getLocations'); return { status: 200, body: { status: 'success' } }; });
    const init = await a.connectWithApiKey('nk-key');
    expect(init.credentials.apiKey).toBe('nk-key');
  });

  it('lists patients from the Nookal envelope', async () => {
    mockFetch((url) => {
      expect(url).toContain('/getPatients');
      return { status: 200, body: { status: 'success', data: { results: { patients: [
        { ID: '5', FirstName: 'Mia', LastName: 'Ross', DOB: '1980-12-01' }] } } } };
    });
    const out: any[] = [];
    for await (const p of a.listPatients!({ apiKey: 'k' })) out.push(p);
    expect(out[0]).toEqual({ externalId: '5', firstName: 'Mia', lastName: 'Ross', dob: '1980-12-01', medicareNumber: null });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest test/pms-nookal.e2e-spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/pms/adapters/nookal.adapter.ts`**

```ts
import { Injectable } from '@nestjs/common';
import type {
  PmsAdapter, PmsCapability, ConnectionInit, PmsCredentials, PmsHealth, PmsPatient, FileRequest, FileReceipt,
} from '../pms-adapter.interface';

const BASE = 'https://api.nookal.com/production/v2';

@Injectable()
export class NookalAdapter implements PmsAdapter {
  readonly pmsType = 'nookal';
  readonly authKind = 'api_key' as const;
  readonly capabilities = new Set<PmsCapability>(['roster.read', 'document.write']);

  private async call(creds: PmsCredentials, endpoint: string, params: Record<string, string> = {}, init?: RequestInit) {
    const q = new URLSearchParams({ api_key: creds.apiKey as string, ...params });
    const r = await fetch(`${BASE}/${endpoint}?${q.toString()}`, init);
    if (!r.ok) throw new Error(`nookal ${endpoint} -> ${r.status} ${await r.text()}`);
    const body: any = await r.json();
    if (body.status && body.status !== 'success') throw new Error(`nookal ${endpoint} -> ${JSON.stringify(body)}`);
    return body;
  }

  async connectWithApiKey(apiKey: string): Promise<ConnectionInit> {
    const creds = { apiKey };
    await this.call(creds, 'getLocations'); // throws if invalid
    return { credentials: creds, capabilities: [...this.capabilities] };
  }
  async healthCheck(creds: PmsCredentials): Promise<PmsHealth> {
    try { await this.call(creds, 'getLocations'); return { ok: true }; }
    catch (e: any) { return { ok: false, detail: String(e?.message ?? e) }; }
  }
  async *listPatients(creds: PmsCredentials): AsyncIterable<PmsPatient> {
    let page = 1;
    for (;;) {
      const body: any = await this.call(creds, 'getPatients', { page: String(page), page_length: '100' });
      const rows = body.data?.results?.patients ?? [];
      for (const p of rows) {
        yield { externalId: String(p.ID ?? p.id), firstName: p.FirstName ?? '', lastName: p.LastName ?? '',
          dob: p.DOB ?? null, medicareNumber: p.MedicareNo ?? null };
      }
      if (rows.length < 100) break;
      page++;
    }
  }
  async fileDocument(creds: PmsCredentials, req: FileRequest): Promise<FileReceipt> {
    const body: any = await this.call(creds, 'uploadPatientFile',
      { patient_id: req.patientExternalId, file_name: req.fileName }, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: req.mediaType, data: req.data.toString('base64') }) });
    return { pmsFilingId: String(body.data?.results?.file_id ?? body.data?.file_id ?? '') };
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest test/pms-nookal.e2e-spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Register + catalog row**

Register `NookalAdapter` in `src/pms/pms.module.ts` (providers + `PMS_ADAPTERS` factory). Add to `src/pms/catalog.ts`:

```ts
  { key: 'nookal', displayName: 'Nookal', segment: 'allied', hosting: 'cloud', tier: 'write_back',
    capabilities: ['roster.read', 'document.write'], status: 'beta', sortOrder: 40 },
```

- [ ] **Step 6: Reseed + commit**

```bash
npm run seed:pms
git add src/pms/adapters/nookal.adapter.ts src/pms/pms.module.ts src/pms/catalog.ts test/pms-nookal.e2e-spec.ts
git commit -m "feat(pms): Nookal adapter (api_key)"
```

---

### Task 3: Coreplus adapter (roster-first)

Coreplus leans "request access". Ship `roster.read` first (tier `roster`); add `document.write` only if the self-serve tier exposes a document-attach endpoint (then bump the capability set + catalog tier in the same commit). The test below covers the roster-read contract.

**Files:**
- Create: `src/pms/adapters/coreplus.adapter.ts`
- Test: `test/pms-coreplus.e2e-spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { CoreplusAdapter } from '../src/pms/adapters/coreplus.adapter';

function mockFetch(handler: (url: string, init: any) => { status: number; body: any }) {
  return jest.spyOn(global, 'fetch').mockImplementation(async (url: any, init: any) => {
    const { status, body } = handler(String(url), init);
    return { ok: status < 400, status, json: async () => body, text: async () => JSON.stringify(body) } as any;
  });
}

describe('CoreplusAdapter', () => {
  const a = new CoreplusAdapter();
  afterEach(() => jest.restoreAllMocks());

  it('declares api_key auth and roster.read (no write yet)', () => {
    expect(a.authKind).toBe('api_key');
    expect(a.capabilities.has('roster.read')).toBe(true);
    expect(a.capabilities.has('document.write')).toBe(false);
  });

  it('verifies the key on connect', async () => {
    mockFetch((url, init) => {
      expect(url).toBe('https://api.coreplus.com.au/v1/patients?page=1&pageSize=1');
      expect(init.headers['X-Api-Key']).toBe('cp-key');
      return { status: 200, body: { items: [] } };
    });
    const init = await a.connectWithApiKey('cp-key');
    expect(init.capabilities).toEqual(['roster.read']);
  });

  it('lists patients', async () => {
    mockFetch(() => ({ status: 200, body: { items: [{ id: 'c9', firstName: 'Lee', lastName: 'Park', dateOfBirth: '1975-07-07' }], totalPages: 1 } }));
    const out: any[] = [];
    for await (const p of a.listPatients!({ apiKey: 'k' })) out.push(p);
    expect(out[0]).toEqual({ externalId: 'c9', firstName: 'Lee', lastName: 'Park', dob: '1975-07-07', medicareNumber: null });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest test/pms-coreplus.e2e-spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/pms/adapters/coreplus.adapter.ts`**

```ts
import { Injectable } from '@nestjs/common';
import type {
  PmsAdapter, PmsCapability, ConnectionInit, PmsCredentials, PmsHealth, PmsPatient,
} from '../pms-adapter.interface';

const BASE = 'https://api.coreplus.com.au/v1';

@Injectable()
export class CoreplusAdapter implements PmsAdapter {
  readonly pmsType = 'coreplus';
  readonly authKind = 'api_key' as const;
  // roster-only until a self-serve document-write endpoint is confirmed.
  readonly capabilities = new Set<PmsCapability>(['roster.read']);

  private headers(creds: PmsCredentials) { return { 'X-Api-Key': creds.apiKey as string, Accept: 'application/json' }; }
  private async req(creds: PmsCredentials, path: string) {
    const r = await fetch(`${BASE}${path}`, { headers: this.headers(creds) });
    if (!r.ok) throw new Error(`coreplus ${path} -> ${r.status} ${await r.text()}`);
    return r.json();
  }
  async connectWithApiKey(apiKey: string): Promise<ConnectionInit> {
    const creds = { apiKey };
    await this.req(creds, '/patients?page=1&pageSize=1'); // throws if invalid
    return { credentials: creds, capabilities: [...this.capabilities] };
  }
  async healthCheck(creds: PmsCredentials): Promise<PmsHealth> {
    try { await this.req(creds, '/patients?page=1&pageSize=1'); return { ok: true }; }
    catch (e: any) { return { ok: false, detail: String(e?.message ?? e) }; }
  }
  async *listPatients(creds: PmsCredentials): AsyncIterable<PmsPatient> {
    let page = 1;
    for (;;) {
      const body: any = await this.req(creds, `/patients?page=${page}&pageSize=100`);
      for (const p of body.items ?? []) {
        yield { externalId: String(p.id), firstName: p.firstName ?? '', lastName: p.lastName ?? '',
          dob: p.dateOfBirth ?? null, medicareNumber: p.medicareNumber ?? null };
      }
      if (page >= (body.totalPages ?? 1)) break;
      page++;
    }
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest test/pms-coreplus.e2e-spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Register + catalog row (tier `roster`)**

Register `CoreplusAdapter` in `src/pms/pms.module.ts`. Add to `src/pms/catalog.ts`:

```ts
  { key: 'coreplus', displayName: 'Coreplus', segment: 'allied', hosting: 'cloud', tier: 'roster',
    capabilities: ['roster.read'], status: 'planned', sortOrder: 50 },
```

- [ ] **Step 6: Reseed + commit**

```bash
npm run seed:pms
git add src/pms/adapters/coreplus.adapter.ts src/pms/pms.module.ts src/pms/catalog.ts test/pms-coreplus.e2e-spec.ts
git commit -m "feat(pms): Coreplus adapter (roster.read)"
```

---

### Task 4: Jane adapter (oauth2, roster-first)

Jane API access is request-gated and OAuth2-based. Ship `roster.read` first; add write later if the granted scope allows. The test pins the OAuth + roster contract.

**Files:**
- Create: `src/pms/adapters/jane.adapter.ts`
- Test: `test/pms-jane.e2e-spec.ts`
- Modify: `.env.example`, `.env.test.example`

- [ ] **Step 1: Write the failing test**

```ts
import { JaneAdapter } from '../src/pms/adapters/jane.adapter';

function mockFetch(handler: (url: string, init: any) => { status: number; body: any }) {
  return jest.spyOn(global, 'fetch').mockImplementation(async (url: any, init: any) => {
    const { status, body } = handler(String(url), init);
    return { ok: status < 400, status, json: async () => body, text: async () => JSON.stringify(body) } as any;
  });
}

describe('JaneAdapter', () => {
  const a = new JaneAdapter('jane-client', 'jane-secret', 'https://clinic.janeapp.com');
  afterEach(() => jest.restoreAllMocks());

  it('declares oauth2 auth + roster.read', () => {
    expect(a.authKind).toBe('oauth2');
    expect(a.capabilities.has('roster.read')).toBe(true);
  });

  it('builds an authorize URL', () => {
    const url = a.getAuthorizeUrl('st', 'http://localhost:8000/pms/connection/callback');
    expect(url).toContain('client_id=jane-client');
    expect(url).toContain('state=st');
    expect(url).toContain('response_type=code');
  });

  it('exchanges a code for tokens', async () => {
    mockFetch((url, init) => {
      expect(url).toContain('/oauth/token');
      expect(init.method).toBe('POST');
      return { status: 200, body: { access_token: 'at', refresh_token: 'rt', expires_in: 7200 } };
    });
    const init = await a.exchangeCode('c', 'http://localhost:8000/pms/connection/callback');
    expect(init.credentials.accessToken).toBe('at');
  });

  it('lists patients', async () => {
    mockFetch((url, init) => {
      expect(init.headers.Authorization).toBe('Bearer at');
      return { status: 200, body: { patients: [{ id: 3, first_name: 'Ivy', last_name: 'Cole', dob: '2000-02-02' }], meta: { next_page: null } } };
    });
    const out: any[] = [];
    for await (const p of a.listPatients!({ accessToken: 'at', refreshToken: 'rt', expiresAt: Date.now() + 1e6 })) out.push(p);
    expect(out[0]).toEqual({ externalId: '3', firstName: 'Ivy', lastName: 'Cole', dob: '2000-02-02', medicareNumber: null });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest test/pms-jane.e2e-spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/pms/adapters/jane.adapter.ts`**

```ts
import { Injectable } from '@nestjs/common';
import type {
  PmsAdapter, PmsCapability, ConnectionInit, PmsCredentials, PmsHealth, PmsPatient,
} from '../pms-adapter.interface';

@Injectable()
export class JaneAdapter implements PmsAdapter {
  readonly pmsType = 'jane';
  readonly authKind = 'oauth2' as const;
  readonly capabilities = new Set<PmsCapability>(['roster.read']);

  // Jane is per-clinic subdomain (https://<clinic>.janeapp.com). For MVP a single configured
  // instance base is injected; multi-instance support is a later enhancement.
  constructor(private clientId: string, private clientSecret: string, private instanceBase: string) {}

  private api() { return `${this.instanceBase}/api/v1`; }

  getAuthorizeUrl(state: string, redirectUri: string): string {
    const q = new URLSearchParams({ client_id: this.clientId, response_type: 'code',
      redirect_uri: redirectUri, state, scope: 'read_patients' });
    return `${this.instanceBase}/oauth/authorize?${q.toString()}`;
  }
  private async tokenRequest(params: Record<string, string>): Promise<PmsCredentials> {
    const r = await fetch(`${this.instanceBase}/oauth/token`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: this.clientId, client_secret: this.clientSecret, ...params }).toString() });
    if (!r.ok) throw new Error(`jane token -> ${r.status} ${await r.text()}`);
    const t: any = await r.json();
    return { accessToken: t.access_token, refreshToken: t.refresh_token, expiresAt: Date.now() + (t.expires_in ?? 7200) * 1000 };
  }
  async exchangeCode(code: string, redirectUri: string): Promise<ConnectionInit> {
    const credentials = await this.tokenRequest({ grant_type: 'authorization_code', code, redirect_uri: redirectUri });
    return { credentials, capabilities: [...this.capabilities] };
  }
  async refreshCredentials(creds: PmsCredentials): Promise<PmsCredentials> {
    return this.tokenRequest({ grant_type: 'refresh_token', refresh_token: creds.refreshToken as string });
  }
  private async ensureFresh(creds: PmsCredentials): Promise<PmsCredentials> {
    if (typeof creds.expiresAt === 'number' && creds.expiresAt < Date.now() + 60_000) return this.refreshCredentials(creds);
    return creds;
  }
  async healthCheck(creds: PmsCredentials): Promise<PmsHealth> {
    try {
      const fresh = await this.ensureFresh(creds);
      const r = await fetch(`${this.api()}/patients?per_page=1`, { headers: { Authorization: `Bearer ${fresh.accessToken}` } });
      return { ok: r.ok, detail: r.ok ? undefined : `status ${r.status}` };
    } catch (e: any) { return { ok: false, detail: String(e?.message ?? e) }; }
  }
  async *listPatients(creds: PmsCredentials): AsyncIterable<PmsPatient> {
    const fresh = await this.ensureFresh(creds);
    let url: string | null = `${this.api()}/patients?per_page=100`;
    while (url) {
      const r = await fetch(url, { headers: { Authorization: `Bearer ${fresh.accessToken}` } });
      if (!r.ok) throw new Error(`jane patients -> ${r.status}`);
      const body: any = await r.json();
      for (const p of body.patients ?? []) {
        yield { externalId: String(p.id), firstName: p.first_name ?? '', lastName: p.last_name ?? '',
          dob: p.dob ?? null, medicareNumber: p.medicare_number ?? null };
      }
      url = body.meta?.next_page ?? null;
    }
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest test/pms-jane.e2e-spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Register (factory with config) + catalog row + env**

In `src/pms/pms.module.ts`, register with a factory (like Halaxy):

```ts
import { JaneAdapter } from './adapters/jane.adapter';
// providers:
{ provide: JaneAdapter, useFactory: (cfg: ConfigService) =>
    new JaneAdapter(cfg.getOrThrow('JANE_CLIENT_ID'), cfg.getOrThrow('JANE_CLIENT_SECRET'), cfg.getOrThrow('JANE_INSTANCE_BASE')),
  inject: [ConfigService] },
// add JaneAdapter to the PMS_ADAPTERS factory args + inject list
```

Append to `.env.example` and `.env.test.example`:

```
JANE_CLIENT_ID=test-jane-client
JANE_CLIENT_SECRET=test-jane-secret
JANE_INSTANCE_BASE=https://clinic.janeapp.com
```

Add to `src/pms/catalog.ts`:

```ts
  { key: 'jane', displayName: 'Jane', segment: 'allied', hosting: 'cloud', tier: 'roster',
    capabilities: ['roster.read'], status: 'planned', sortOrder: 60 },
```

- [ ] **Step 6: Reseed + commit**

```bash
npm run seed:pms
git add src/pms/adapters/jane.adapter.ts src/pms/pms.module.ts src/pms/catalog.ts .env.example .env.test.example test/pms-jane.e2e-spec.ts
git commit -m "feat(pms): Jane adapter (oauth2, roster.read)"
```

---

### Task 5: Frontend auth-kind map + full suite

The frontend connect surface derives `authKind` from the PMS key (`app/(main)/settings/integrations/page.tsx`, helper `authKindFor`). Update it so the new OAuth PMS (Jane) branches to the OAuth button.

**Files:**
- Modify (frontend repo): `app/(main)/settings/integrations/page.tsx`

- [ ] **Step 1: Update `authKindFor`** to treat `halaxy` and `jane` as oauth2:

```ts
const authKindFor = (key: string): "api_key" | "oauth2" =>
  (key === "halaxy" || key === "jane") ? "oauth2" : "api_key";
```

- [ ] **Step 2: Run the backend full suite**

Run (api repo): `npm test`
Expected: all suites PASS, including the four new adapter specs.

- [ ] **Step 3: Run the frontend build**

Run (web repo): `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit (frontend)**

```bash
git add "app/(main)/settings/integrations/page.tsx"
git commit -m "feat(web): route Jane through the OAuth connect branch"
```

---

### Task 6: Documentation

**Files:**
- Modify: `README.md` (api repo)

- [ ] **Step 1: Update the PMS section** to list all six adapters (Cliniko, Halaxy, Power Diary, Nookal, Coreplus, Jane) with their auth kind, tier, and capabilities, and note the roster-only status of Coreplus/Jane pending write-access confirmation.

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs(pms): document all self-serve adapters"
```

---

## Self-Review notes (already applied)

- **Spec coverage:** all four "connectable now" PMSes from the design's plan-2 scope (Power Diary, Nookal, Coreplus, Jane) each get an adapter + catalog row + contract test. Coreplus/Jane correctly downgraded to `roster.read`/tier `roster` with an explicit upgrade path, matching the spec's "verify access; ship roster-only if write isn't self-serve" risk note.
- **Type consistency:** every adapter implements the exact `PmsAdapter` interface members (`pmsType`, `authKind`, `capabilities`, `connectWithApiKey`/`getAuthorizeUrl`+`exchangeCode`, `healthCheck`, `listPatients`, optional `fileDocument`) defined in the integration backend plan. `ConnectionInit`/`PmsPatient`/`FileRequest`/`FileReceipt` shapes reused verbatim.
- **No placeholders:** every adapter ships complete code; vendor-specific endpoint/auth confirmations are explicitly flagged as implementation-time verification with the contract test as the pinned spec, not missing code.
- **No new pipeline/page work:** registration + catalog row only; the data-driven catalog and connect surfaces pick up new adapters automatically (frontend touch limited to the one-line `authKindFor` map).
```
