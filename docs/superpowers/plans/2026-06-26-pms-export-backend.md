# PMS Manual-Export Bundle — Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give export-mode tenants (and any PMS we can't write to via API) a downloadable ZIP of their confirmed documents — smart-named PDFs + a CSV manifest + an HTML worklist — plus a "mark filed" action that closes the loop, so a receptionist files a day's documents in a few bulk actions instead of one-by-one.

**Architecture:** Reuse the existing triage/review pipeline unchanged. At confirm time, documents on a tenant with no write-capable PMS move to a new `writeBackStatus = 'export_pending'` (instead of `'not_applicable'`) — this *is* the export queue (the column is already indexed). A new `PmsExportService` lists the queue, streams a ZIP via the already-installed `archiver`, and transitions docs to `'filed_manually'` when the receptionist confirms they're in the PMS. All document bytes come from the existing `StorageService`; every export/file action is audited.

**Tech Stack:** NestJS, Prisma (Postgres), `archiver` (already a dependency), `@aws-sdk/client-s3` via `StorageService`, Jest e2e (`*.e2e-spec.ts`, run with `npx jest <name>`).

---

## Conventions in this codebase (read before starting)

- Tests live in `test/*.e2e-spec.ts`; run a single suite with `npx jest <suite-substring>`. Jest config is inline in `package.json` (testRegex `.e2e-spec.ts$`, `maxWorkers: 1`).
- Helpers for tests: `createTestApp`, `signupUser` from `test/helpers.ts`. `signupUser` returns `{ access, tenantId, userId, email }`.
- `writeBackStatus` is a plain `String` column (`prisma/schema.prisma` line ~99), default `"not_applicable"`, already `@@index`ed. **New status values need no migration.**
- `StorageService` (`src/common/storage.service.ts`) is provided by the `@Global` `CommonModule` — inject it anywhere. Key methods: `putObject(tenantId, Buffer, mediaType) -> "s3://…"`, `getObject(uri) -> Buffer`, `sha256Hex(Buffer)`.
- `AuditService.record({ tenantId, documentId, eventType, actor, detail })` (`src/common/audit.service.ts`).
- Document model fields used here: `id, tenantId, docType, urgency, mediaType, rawUri, matchedPatientId, assignedToProviderId, extracted (Json, has .summary), createdAt, writeBackStatus`. Patient: `firstName, lastName, dob (Date), medicareNumber`. Provider: `name`.
- Streaming binary responses uses `@Res() res: Response` (see `src/documents/export.controller.ts` and `review.controller.ts` `raw`).

---

## File Structure

- Create `src/pms/pms-export.util.ts` — pure helpers: filename building, CSV manifest, HTML worklist. No I/O → unit-testable.
- Create `src/pms/pms-export.service.ts` — queue listing, ZIP streaming, mark-filed. Injects `PrismaService`, `StorageService`, `AuditService`.
- Create `src/pms/pms-export.controller.ts` — `GET /pms/export/pending`, `GET /pms/export/bundle`, `POST /pms/export/mark-filed`.
- Modify `src/pms/pms.module.ts` — register the new service + controller.
- Modify `src/documents/review.service.ts` — confirm sets `'export_pending'` (not `'not_applicable'`) when the tenant has no write-capable PMS.
- Create `test/pms-export-util.e2e-spec.ts` — unit tests for the pure helpers.
- Create `test/pms-export.e2e-spec.ts` — endpoint tests (pending list, bundle, mark-filed).

---

## Task 1: Pure export helpers (filenames, CSV, HTML)

**Files:**
- Create: `src/pms/pms-export.util.ts`
- Test: `test/pms-export-util.e2e-spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
// test/pms-export-util.e2e-spec.ts
import { extensionFor, sanitizeSegment, smartFileName, buildIndexCsv, buildWorklistHtml, ExportRow } from '../src/pms/pms-export.util';

const row: ExportRow = {
  documentId: 'doc-1', lastName: "O'Hara", firstName: 'Mary', dob: '1965-03-14',
  medicareNumber: '4123 98765 2', docType: 'radiology', documentDate: '2024-05-14',
  provider: 'Dr Mitchell', urgency: 'routine', summary: 'Normal MRI brain', mediaType: 'application/pdf',
  fileName: '',
};

describe('pms-export.util', () => {
  it('maps media types to extensions', () => {
    expect(extensionFor('application/pdf')).toBe('pdf');
    expect(extensionFor('image/jpeg')).toBe('jpg');
    expect(extensionFor('application/zip')).toBe('bin');
  });

  it('sanitizes name segments to safe filename chars', () => {
    expect(sanitizeSegment("O'Hara")).toBe('O-Hara');
    expect(sanitizeSegment('  ')).toBe('unknown');
  });

  it('builds a smart filename Last_First_DOB_Type_Date.ext', () => {
    expect(smartFileName({ lastName: "O'Hara", firstName: 'Mary', dob: '1965-03-14' }, 'radiology', '2024-05-14', 'application/pdf'))
      .toBe('O-Hara_Mary_19650314_radiology_20240514.pdf');
  });

  it('escapes CSV cells containing commas/quotes', () => {
    const csv = buildIndexCsv([{ ...row, fileName: 'f.pdf', medicareNumber: 'a,b', summary: 'has "quote"' }]);
    const [header, line] = csv.trim().split('\n');
    expect(header).toContain('file_name,last_name');
    expect(line).toContain('"a,b"');
    expect(line).toContain('"has ""quote"""');
  });

  it('renders a worklist HTML table with one row per document', () => {
    const html = buildWorklistHtml([{ ...row, fileName: 'f.pdf' }], '2026-06-26');
    expect(html).toContain('<table');
    expect(html).toContain('O&#39;Hara'.replace('&#39;', "'")); // last name present
    expect(html).toContain('1 document');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest pms-export-util`
Expected: FAIL — `Cannot find module '../src/pms/pms-export.util'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/pms/pms-export.util.ts
export interface ExportRow {
  documentId: string;
  lastName: string;
  firstName: string;
  dob: string | null;            // yyyy-mm-dd
  medicareNumber: string | null;
  docType: string | null;
  documentDate: string | null;   // yyyy-mm-dd
  provider: string | null;
  urgency: string | null;
  summary: string | null;
  mediaType: string;
  fileName: string;              // smart name incl. extension
}

const EXT: Record<string, string> = {
  'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg',
  'image/gif': 'gif', 'image/webp': 'webp', 'text/plain': 'txt',
};

export function extensionFor(mediaType: string): string {
  return EXT[mediaType] ?? 'bin';
}

export function sanitizeSegment(s: string | null | undefined): string {
  const cleaned = (s ?? '').normalize('NFKD').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return cleaned || 'unknown';
}

export function smartFileName(
  p: { lastName?: string | null; firstName?: string | null; dob?: string | null },
  docType: string | null,
  date: string | null,
  mediaType: string,
): string {
  const parts = [
    sanitizeSegment(p.lastName),
    sanitizeSegment(p.firstName),
    (p.dob ?? '').replace(/-/g, ''),
    sanitizeSegment(docType ?? 'document'),
    (date ?? '').replace(/-/g, ''),
  ].filter(Boolean);
  return `${parts.join('_')}.${extensionFor(mediaType)}`;
}

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildIndexCsv(rows: ExportRow[]): string {
  const header = ['file_name', 'last_name', 'first_name', 'dob', 'medicare_number',
    'doc_type', 'document_date', 'provider', 'urgency', 'summary', 'document_id'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push([r.fileName, r.lastName, r.firstName, r.dob, r.medicareNumber,
      r.docType, r.documentDate, r.provider, r.urgency, r.summary, r.documentId].map(csvCell).join(','));
  }
  return lines.join('\n') + '\n';
}

export function buildWorklistHtml(rows: ExportRow[], generatedAt: string): string {
  const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  const trs = rows.map((r) => `<tr>
    <td><input type="checkbox"></td>
    <td>${esc(r.lastName)}, ${esc(r.firstName)}</td>
    <td>${esc(r.dob)}</td><td>${esc(r.medicareNumber)}</td>
    <td>${esc(r.docType)}</td><td>${esc(r.documentDate)}</td>
    <td>${esc(r.provider)}</td><td>${esc(r.urgency)}</td><td>${esc(r.fileName)}</td>
  </tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>CliniDoc filing worklist</title>
<style>body{font-family:sans-serif;margin:24px;color:#0f172a}h1{font-size:18px}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{border:1px solid #cbd5e1;padding:6px;text-align:left}th{background:#f1f5f9}</style></head>
<body><h1>CliniDoc — documents to file (${esc(generatedAt)})</h1>
<p>${rows.length} document${rows.length === 1 ? '' : 's'}. Tick each once filed in your PMS.</p>
<table><thead><tr><th>Filed</th><th>Patient</th><th>DOB</th><th>Medicare</th>
<th>Type</th><th>Date</th><th>Provider</th><th>Urgency</th><th>File</th></tr></thead>
<tbody>${trs}</tbody></table></body></html>`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest pms-export-util`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/pms/pms-export.util.ts test/pms-export-util.e2e-spec.ts
git commit -m "feat(pms): pure helpers for export bundle (filenames, CSV, worklist)"
```

---

## Task 2: PmsExportService — queue list, ZIP stream, mark-filed

**Files:**
- Create: `src/pms/pms-export.service.ts`
- Test: `test/pms-export.e2e-spec.ts` (service-level portion; controller added in Task 3)

- [ ] **Step 1: Write the failing test (listPending + markFiled via the service)**

```ts
// test/pms-export.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import { createTestApp, signupUser } from './helpers';
import { PrismaService } from '../src/prisma/prisma.service';
import { PmsExportService } from '../src/pms/pms-export.service';

describe('PmsExportService', () => {
  let app: INestApplication; let prisma: PrismaService; let svc: PmsExportService;
  beforeAll(async () => { ({ app, prisma } = await createTestApp()); svc = app.get(PmsExportService); });
  afterAll(async () => app.close());

  const seedDoc = async (tenantId: string, over: Record<string, unknown> = {}) =>
    prisma.document.create({ data: {
      tenantId, contentHash: 'h-' + Math.random(), source: 'upload', rawUri: 's3://x/y',
      mediaType: 'application/pdf', status: 'filed', writeBackStatus: 'export_pending', ...over } });

  it('lists export-pending docs with patient + metadata', async () => {
    const { tenantId } = await signupUser(app);
    const patient = await prisma.patient.create({ data: {
      tenantId, firstName: 'Mary', lastName: 'Brown', dob: new Date('1965-03-14'), medicareNumber: '4123 98765 2' } });
    await seedDoc(tenantId, { docType: 'radiology', matchedPatientId: patient.id, urgency: 'routine' });
    const { items, total } = await svc.listPending(tenantId);
    expect(total).toBe(1);
    expect(items[0]).toMatchObject({ lastName: 'Brown', firstName: 'Mary', docType: 'radiology', medicareNumber: '4123 98765 2' });
    expect(items[0].fileName).toContain('Brown_Mary_19650314_radiology');
  });

  it('marks only export-pending docs as filed_manually and audits each', async () => {
    const { tenantId } = await signupUser(app, 'Clinic E', 'e@clinic.test');
    const d1 = await seedDoc(tenantId);
    const d2 = await seedDoc(tenantId, { writeBackStatus: 'filed_manually' }); // already filed -> ignored
    const res = await svc.markFiled(tenantId, [d1.id, d2.id], 'e@clinic.test');
    expect(res.filed).toBe(1);
    const after = await prisma.document.findUniqueOrThrow({ where: { id: d1.id } });
    expect(after.writeBackStatus).toBe('filed_manually');
    const audit = await prisma.auditEvent.findFirst({ where: { documentId: d1.id, eventType: 'FILED_MANUALLY' } });
    expect(audit).not.toBeNull();
  });
});
```

> Note: the audit table accessor is `prisma.auditEvent` — confirm the model name with `grep -n "model AuditEvent\|model Audit" prisma/schema.prisma` and adjust if it differs (e.g. `prisma.audit`).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest pms-export`
Expected: FAIL — `Cannot find module '../src/pms/pms-export.service'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/pms/pms-export.service.ts
import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import archiver from 'archiver';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage.service';
import { AuditService } from '../common/audit.service';
import { ExportRow, buildIndexCsv, buildWorklistHtml, smartFileName } from './pms-export.util';

const MAX_BUNDLE = 200; // bound memory: never bundle more than this in one download

@Injectable()
export class PmsExportService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private audit: AuditService,
  ) {}

  private async rowsFor(tenantId: string) {
    const docs = await this.prisma.document.findMany({
      where: { tenantId, writeBackStatus: 'export_pending' },
      orderBy: { createdAt: 'asc' }, take: MAX_BUNDLE,
    });
    const patientIds = [...new Set(docs.map((d) => d.matchedPatientId).filter(Boolean) as string[])];
    const providerIds = [...new Set(docs.map((d) => d.assignedToProviderId).filter(Boolean) as string[])];
    const patients = patientIds.length
      ? await this.prisma.patient.findMany({ where: { id: { in: patientIds } } }) : [];
    const providers = providerIds.length
      ? await this.prisma.provider.findMany({ where: { id: { in: providerIds } } }) : [];
    const pById = new Map(patients.map((p) => [p.id, p]));
    const provById = new Map(providers.map((p) => [p.id, p]));

    return docs.map((d) => {
      const p = d.matchedPatientId ? pById.get(d.matchedPatientId) : undefined;
      const dob = p?.dob ? p.dob.toISOString().slice(0, 10) : null;
      const documentDate = d.createdAt.toISOString().slice(0, 10);
      const row: ExportRow = {
        documentId: d.id,
        lastName: p?.lastName ?? '', firstName: p?.firstName ?? '',
        dob, medicareNumber: p?.medicareNumber ?? null,
        docType: d.docType, documentDate,
        provider: d.assignedToProviderId ? (provById.get(d.assignedToProviderId)?.name ?? null) : null,
        urgency: d.urgency, summary: (d.extracted as any)?.summary ?? null,
        mediaType: d.mediaType,
        fileName: smartFileName({ lastName: p?.lastName, firstName: p?.firstName, dob }, d.docType, documentDate, d.mediaType),
      };
      return { doc: d, row };
    });
  }

  async listPending(tenantId: string) {
    const rows = await this.rowsFor(tenantId);
    return { items: rows.map((r) => r.row), total: rows.length };
  }

  /** Stream the export ZIP into the response and record an EXPORTED audit event. */
  async streamBundle(tenantId: string, actor: string, res: Response): Promise<void> {
    const rows = await this.rowsFor(tenantId);
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="clinidoc-export-${stamp}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    const seen = new Map<string, number>();
    for (const { doc, row } of rows) {
      let name = row.fileName;
      const n = seen.get(name) ?? 0;
      seen.set(name, n + 1);
      if (n > 0) name = name.replace(/(\.[^.]+)$/, `-${n}$1`); // de-dup identical names
      const bytes = await this.storage.getObject(doc.rawUri);
      archive.append(bytes, { name: `documents/${name}` });
    }
    archive.append(buildIndexCsv(rows.map((r) => r.row)), { name: 'index.csv' });
    archive.append(buildWorklistHtml(rows.map((r) => r.row), stamp), { name: 'worklist.html' });

    await this.audit.record({
      tenantId, documentId: null, eventType: 'EXPORTED', actor,
      detail: { count: rows.length, documentIds: rows.map((r) => r.doc.id) },
    });
    await archive.finalize();
  }

  async markFiled(tenantId: string, ids: string[], actor: string) {
    if (!ids.length) return { filed: 0 };
    const docs = await this.prisma.document.findMany({
      where: { tenantId, id: { in: ids }, writeBackStatus: 'export_pending' }, select: { id: true },
    });
    const found = docs.map((d) => d.id);
    if (found.length) {
      await this.prisma.document.updateMany({
        where: { tenantId, id: { in: found } }, data: { writeBackStatus: 'filed_manually' } });
      for (const id of found) {
        await this.audit.record({ tenantId, documentId: id, eventType: 'FILED_MANUALLY', actor, detail: {} });
      }
    }
    return { filed: found.length };
  }
}
```

- [ ] **Step 4: Register the service so the test can resolve it**

In `src/pms/pms.module.ts`, add the import and provider (full controller wiring comes in Task 3):

```ts
import { PmsExportService } from './pms-export.service';
```

Add `PmsExportService` to the `providers: [ ... ]` array and to `exports: [ ... ]`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest pms-export`
Expected: PASS (2 tests). If `archiver` import errors with "is not a function", change the import to `import archiver = require('archiver');` (tsconfig `esModuleInterop` should make the default import work — verify with `grep esModuleInterop tsconfig.json`).

- [ ] **Step 6: Commit**

```bash
git add src/pms/pms-export.service.ts src/pms/pms.module.ts test/pms-export.e2e-spec.ts
git commit -m "feat(pms): export service — queue list, ZIP stream, mark-filed"
```

---

## Task 3: PmsExportController + endpoints

**Files:**
- Create: `src/pms/pms-export.controller.ts`
- Modify: `src/pms/pms.module.ts` (register controller)
- Test: `test/pms-export.e2e-spec.ts` (append endpoint tests)

- [ ] **Step 1: Append failing endpoint tests**

```ts
// test/pms-export.e2e-spec.ts  (add inside the describe, after existing tests)
import * as request from 'supertest';

it('GET /pms/export/pending returns the worklist', async () => {
  const { access, tenantId } = await signupUser(app, 'Clinic F', 'f@clinic.test');
  await prisma.document.create({ data: {
    tenantId, contentHash: 'h-f', source: 'upload', rawUri: 's3://x/y',
    mediaType: 'application/pdf', status: 'filed', writeBackStatus: 'export_pending', docType: 'referral' } });
  const r = await request(app.getHttpServer()).get('/pms/export/pending')
    .set('Authorization', `Bearer ${access}`).expect(200);
  expect(r.body.total).toBe(1);
  expect(r.body.items[0].docType).toBe('referral');
});

it('GET /pms/export/bundle streams a zip and audits EXPORTED', async () => {
  const { app: app2, prisma: prisma2 } = await createTestApp();
  const { access, tenantId } = await signupUser(app2, 'Clinic G', 'g@clinic.test');
  const storage = app2.get<import('../src/common/storage.service').StorageService>(
    (await import('../src/common/storage.service')).StorageService);
  const uri = await storage.putObject(tenantId, Buffer.from('%PDF-1.4 test'), 'application/pdf');
  await prisma2.document.create({ data: {
    tenantId, contentHash: 'h-g', source: 'upload', rawUri: uri,
    mediaType: 'application/pdf', status: 'filed', writeBackStatus: 'export_pending', docType: 'radiology' } });

  const r = await request(app2.getHttpServer()).get('/pms/export/bundle')
    .set('Authorization', `Bearer ${access}`).buffer(true).parse((res, cb) => {
      const chunks: Buffer[] = []; res.on('data', (c) => chunks.push(c)); res.on('end', () => cb(null, Buffer.concat(chunks)));
    }).expect(200);
  expect(r.headers['content-type']).toContain('application/zip');
  expect(Buffer.from(r.body).slice(0, 2).toString()).toBe('PK'); // ZIP magic bytes
  const audit = await prisma2.auditEvent.findFirst({ where: { tenantId, eventType: 'EXPORTED' } });
  expect(audit).not.toBeNull();
  await app2.close();
});

it('POST /pms/export/mark-filed transitions docs', async () => {
  const { access, tenantId } = await signupUser(app, 'Clinic H', 'h@clinic.test');
  const d = await prisma.document.create({ data: {
    tenantId, contentHash: 'h-h', source: 'upload', rawUri: 's3://x/y',
    mediaType: 'application/pdf', status: 'filed', writeBackStatus: 'export_pending' } });
  await request(app.getHttpServer()).post('/pms/export/mark-filed')
    .set('Authorization', `Bearer ${access}`).send({ ids: [d.id] }).expect(201);
  const after = await prisma.document.findUniqueOrThrow({ where: { id: d.id } });
  expect(after.writeBackStatus).toBe('filed_manually');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx jest pms-export`
Expected: FAIL — routes return 404 (controller not registered).

- [ ] **Step 3: Implement the controller**

```ts
// src/pms/pms-export.controller.ts
import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserT } from '../auth/jwt.strategy';
import { PmsExportService } from './pms-export.service';

@Controller('pms/export')
@UseGuards(JwtAuthGuard)
export class PmsExportController {
  constructor(private exportSvc: PmsExportService) {}

  @Get('pending')
  pending(@CurrentUser() u: CurrentUserT) {
    return this.exportSvc.listPending(u.tenantId);
  }

  @Get('bundle')
  bundle(@CurrentUser() u: CurrentUserT, @Res() res: Response) {
    return this.exportSvc.streamBundle(u.tenantId, u.email, res);
  }

  @Post('mark-filed')
  markFiled(@CurrentUser() u: CurrentUserT, @Body() body: { ids?: string[] }) {
    const ids = Array.isArray(body?.ids) ? body.ids.filter((x) => typeof x === 'string') : [];
    return this.exportSvc.markFiled(u.tenantId, ids, u.email);
  }
}
```

- [ ] **Step 4: Register the controller**

In `src/pms/pms.module.ts`:

```ts
import { PmsExportController } from './pms-export.controller';
```

Add `PmsExportController` to the `controllers: [ ... ]` array (alongside `PmsController`).

- [ ] **Step 5: Run to verify pass**

Run: `npx jest pms-export`
Expected: PASS (5 tests total in the suite).

- [ ] **Step 6: Commit**

```bash
git add src/pms/pms-export.controller.ts src/pms/pms.module.ts test/pms-export.e2e-spec.ts
git commit -m "feat(pms): export endpoints (pending, bundle, mark-filed)"
```

---

## Task 4: Route confirmed export-mode docs into the queue

**Files:**
- Modify: `src/documents/review.service.ts` (the `confirm` method)
- Test: `test/pms-export.e2e-spec.ts` (append) and update any test asserting the old `'not_applicable'` value

- [ ] **Step 1: Find tests that assert the old status**

Run: `grep -rn "not_applicable" test src/documents/review.service.ts`
Expected: shows `review.service.ts` confirm branch + any tests asserting `writeBackStatus === 'not_applicable'` after confirm on a PMS-less tenant. Note them — each must change to `'export_pending'`.

- [ ] **Step 2: Write the failing test**

```ts
// test/pms-export.e2e-spec.ts  (append inside describe)
it('confirm on a tenant with no write-capable PMS queues the doc for export', async () => {
  const { access, tenantId } = await signupUser(app, 'Clinic I', 'i@clinic.test');
  const patient = await prisma.patient.create({ data: { tenantId, firstName: 'Jo', lastName: 'Tan' } });
  const doc = await prisma.document.create({ data: {
    tenantId, contentHash: 'h-i', source: 'upload', rawUri: 's3://x/y', mediaType: 'application/pdf',
    status: 'needs_review', matchedPatientId: patient.id, docType: 'referral' } });
  await request(app.getHttpServer()).post(`/review/${doc.id}/confirm`)
    .set('Authorization', `Bearer ${access}`)
    .send({ patient_id: patient.id, doc_type: 'referral', accepted_unchanged: true }).expect(201);
  const after = await prisma.document.findUniqueOrThrow({ where: { id: doc.id } });
  expect(after.status).toBe('filed');
  expect(after.writeBackStatus).toBe('export_pending');
});
```

- [ ] **Step 3: Run to verify failure**

Run: `npx jest pms-export -t "queues the doc for export"`
Expected: FAIL — `after.writeBackStatus` is `'not_applicable'`.

- [ ] **Step 4: Update the confirm logic**

In `src/documents/review.service.ts`, inside `confirm()`, change the write-back status and the webhook condition:

```ts
// was: writeBackStatus: canWrite ? 'pending' : 'not_applicable'
writeBackStatus: canWrite ? 'pending' : 'export_pending' } });
```

```ts
// was: if (updated.writeBackStatus === 'not_applicable') {
if (updated.writeBackStatus === 'export_pending') {
  await this.webhooks.emit(user.tenantId, 'document.filed', { document_id: updated.id, status: updated.status });
}
```

- [ ] **Step 5: Fix any other tests found in Step 1**

For each test asserting `writeBackStatus === 'not_applicable'` after a confirm on a PMS-less tenant, change the expectation to `'export_pending'`. (Do **not** change unrelated uses — e.g. the default column value or roster code.)

- [ ] **Step 6: Run to verify pass**

Run: `npx jest pms-export`
Expected: PASS (6 tests).

- [ ] **Step 7: Commit**

```bash
git add src/documents/review.service.ts test/
git commit -m "feat(pms): route confirmed export-mode docs into the export queue"
```

---

## Task 5: Full verification

- [ ] **Step 1: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -v "metering.e2e-spec" | grep "error TS"`
Expected: no output (the pre-existing `metering.e2e-spec.ts` errors are unrelated and ignored).

- [ ] **Step 2: Run the PMS + review + webhook suites**

Run: `npx jest pms- review webhook disposition credits > /tmp/verify.log 2>&1; grep -E "Tests:|Test Suites:|FAIL" /tmp/verify.log`
Expected: all green. Investigate any `FAIL` — most likely a remaining `not_applicable` assertion from Task 4 Step 1.

- [ ] **Step 3: Commit any fixes, then final commit**

```bash
git add -A && git commit -m "test(pms): green after export feature" || echo "nothing to commit"
```

---

## Self-Review

- **Spec coverage:** export queue (Task 4) ✓; smart-named files (Task 1 `smartFileName`, Task 2 archive append) ✓; CSV manifest (Task 1 `buildIndexCsv`) ✓; HTML worklist (Task 1 `buildWorklistHtml`) ✓; bundle download (Task 2/3 `streamBundle` + `/bundle`) ✓; mark-filed close-the-loop (Task 2/3) ✓; audit/governance (EXPORTED + FILED_MANUALLY events) ✓; memory bound (`MAX_BUNDLE = 200`) ✓.
- **Type consistency:** `ExportRow` defined in Task 1 is the only row type, reused in Task 2/3. `streamBundle/listPending/markFiled` signatures match between service (Task 2) and controller (Task 3).
- **No placeholders:** every step has runnable code/commands.
- **Deferred (not in scope, noted for roadmap):** per-PMS filename/folder templates, QR/barcode cover sheets, HL7/secure-messaging delivery, browser-extension autofill. The funnel metric (`received→confirmed→export_pending→filed_manually`) is queryable today via `writeBackStatus` + audit events; a dashboard is a follow-up.
