# Frontend Implementation Plan — Feature Completion (Next.js)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **HOW TO FOLLOW THIS PLAN (read first).**
> This plan **upgrades the existing Next.js web app** (`clinidoc-web`). It finishes the UI for the “feature completion” backend plan: **channel setup shows system-generated credentials** (the user no longer types an address) with copy buttons + secret rotation; the **review screens show the matched patient’s name** instead of a UUID; **the roster table gets manual add/edit/delete**; the **document detail gets a “change type” control** and an **audit-trail panel**; and **settings can update the display name**.
>
> **Rules:** Do tasks in order; steps in order. When a step shows a file path + code block, create/modify that exact file with that exact code. When a step says **Run:**, run it and confirm the result. For test tasks (pure helpers/components), write the failing test first, see it fail, implement, see it pass, commit.
>
> **Prerequisite:** the **feature-completion backend plan** is built and running, exposing: `POST /org/channels` (returns `{ ...channel, setup }`), `POST /org/channels/:id/regenerate-secret`, `POST/PATCH/DELETE /patients`, `matched_patient` on `/review` + `/review/:id`, `PATCH /review/:id`, `GET /review/:id/audit`, and `PATCH /auth/me`.
>
> **Out of scope (excluded by request):** PMS, email verification, production/ops.

**Architecture:** Reads in Server Components via the existing server-only `api`; mutations via Server Actions. Where a mutation returns data to **show once** (channel credentials) or needs inline interactivity (edit a roster row), a small Client Component uses `useActionState`. The backend API key/JWT stays server-side — unchanged.

## File structure (what changes)

```
lib/types.ts                                   (mod)  — MatchedPatient, AuditEvent, ChannelSetup; matched_patient on ReviewItem/ReviewDetail
lib/api.ts                                     (mod)  — channel create({type,label})+regenerate, patient CRUD, doc update, audit, profile
components/CopyField.tsx                        (new)  — label + value + copy button (client)
components/CredentialsPanel.tsx                 (new)  — renders a channel `setup` bundle (client)
components/ReviewTable.tsx                      (mod)  — show matched patient name
app/(main)/channels/ChannelForm.tsx            (mod)  — type+label only; show returned credentials once
app/(main)/channels/actions.ts                 (mod)  — create returns setup; + regenerateAction
app/(main)/channels/RegenerateSecret.tsx       (new)  — per-row rotate + show new secret (client)
app/(main)/review/[id]/page.tsx                (mod)  — matched patient name, change-type control, audit panel
app/(main)/review/[id]/actions.ts              (mod)  — + changeTypeAction
app/(main)/roster/PatientRow.tsx               (new)  — inline edit/delete (client)
app/(main)/roster/AddPatient.tsx               (new)  — add-patient form (client)
app/(main)/roster/actions.ts                   (mod)  — + add/update/delete patient actions
app/(main)/roster/page.tsx                     (mod)  — wire AddPatient + PatientRow
app/(main)/settings/page.tsx                   (mod)  — + display-name form
app/(main)/settings/actions.ts                 (mod)  — + updateNameAction
tests/copyField.test.tsx · tests/reviewTable.test.tsx (mod) — component tests
```

---

## Task 1: Types + API client

**Files:** Modify `lib/types.ts`, `lib/api.ts`

- [ ] **Step 1: Types**

In `lib/types.ts`, add the matched-patient shape to `ReviewItem` and `ReviewDetail`, and new schemas:
```ts
export const MatchedPatient = z.object({
  id: z.string(), first_name: z.string(), last_name: z.string(), dob: z.string().nullable(),
});
export type MatchedPatient = z.infer<typeof MatchedPatient>;

export const AuditEvent = z.object({
  id: z.string(), event_type: z.string(), actor: z.string(),
  detail: z.any().nullable(), created_at: z.string(),
});
export type AuditEvent = z.infer<typeof AuditEvent>;

export const ChannelSetup = z.object({
  kind: z.string(), instructions: z.string(), fields: z.record(z.string(), z.string()),
});
export type ChannelSetup = z.infer<typeof ChannelSetup>;
```
Then extend `ReviewItem` and `ReviewDetail` — add this line inside each `z.object({ ... })`:
```ts
  matched_patient: MatchedPatient.nullable(),
```
(Add it to both `ReviewItem` and `ReviewDetail`. Put the `MatchedPatient` definition **above** those two so it’s in scope.)

- [ ] **Step 2: API methods**

In `lib/api.ts`, update the channel create signature and add the new calls. Replace the existing `createChannel` line and add the others:
```ts
  createChannel:  (body: { type: string; label?: string }) => post("/org/channels", body),
  regenerateChannelSecret: (id: string) => post(`/org/channels/${id}/regenerate-secret`),
  createPatient:  (b: { first_name: string; last_name: string; dob?: string | null; medicare_number?: string | null }) => post("/patients", b),
  updatePatient:  async (id: string, b: Record<string, unknown>) =>
                    fetch(`${BASE}/patients/${id}`, { method: "PATCH", headers: await authHeaders(), body: JSON.stringify(b) }).then(r => r.json()),
  deletePatient:  async (id: string) =>
                    fetch(`${BASE}/patients/${id}`, { method: "DELETE", headers: await authHeaders() }).then(r => r.json()),
  updateDoc:      async (id: string, b: { doc_type?: string | null; patient_id?: string | null }) =>
                    fetch(`${BASE}/review/${id}`, { method: "PATCH", headers: await authHeaders(), body: JSON.stringify(b) }).then(r => r.json()),
  getAudit:       async (id: string) => AuditEvent.array().parse(await get(`/review/${id}/audit`)),
  updateProfile:  (name: string) => post("/auth/me", { name }),
```
> `post(...)` uses POST; `/auth/me` is a `PATCH` on the backend. Add a tiny `patch` helper or inline the fetch — to keep it simple, replace the `updateProfile` line with an inline PATCH:
```ts
  updateProfile:  async (name: string) =>
                    fetch(`${BASE}/auth/me`, { method: "PATCH", headers: await authHeaders(), body: JSON.stringify({ name }) }).then(r => r.json()),
```
Add `AuditEvent` to the type import at the top of `lib/api.ts`.

- [ ] **Step 3: Commit**
```bash
git add lib/types.ts lib/api.ts
git commit -m "feat(web): types + api for channel setup, patient CRUD, doc update, audit, profile"
```

---

## Task 2: CopyField component (tested)

**Files:** Create `components/CopyField.tsx`, `tests/copyField.test.tsx`

- [ ] **Step 1: Failing test**

`tests/copyField.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { CopyField } from "@/components/CopyField";

test("renders the label and value", () => {
  render(<CopyField label="Forwarding address" value="docs-abc@incoming.test" />);
  expect(screen.getByText("Forwarding address")).toBeTruthy();
  expect((screen.getByDisplayValue("docs-abc@incoming.test"))).toBeTruthy();
  expect(screen.getByRole("button", { name: /copy/i })).toBeTruthy();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/copyField.test.tsx`
Expected: FAIL ("Cannot find module '@/components/CopyField'").

- [ ] **Step 3: Implement**

`components/CopyField.tsx`:
```tsx
"use client";
import { useState } from "react";

export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <span className="flex items-stretch gap-2">
        <input readOnly value={value} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs" />
        <button type="button" onClick={copy}
          className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-50">
          {copied ? "Copied" : "Copy"}
        </button>
      </span>
    </label>
  );
}
```

- [ ] **Step 4: Run + commit**
```bash
npx vitest run tests/copyField.test.tsx   # → PASS
git add components/CopyField.tsx tests/copyField.test.tsx
git commit -m "feat(web): CopyField component + test"
```

---

## Task 3: CredentialsPanel + channel create-with-credentials UX

**Files:** Create `components/CredentialsPanel.tsx`, `app/(main)/channels/RegenerateSecret.tsx`; Modify `app/(main)/channels/actions.ts`, `app/(main)/channels/ChannelForm.tsx`

- [ ] **Step 1: CredentialsPanel**

`components/CredentialsPanel.tsx`:
```tsx
import { CopyField } from "./CopyField";
import type { ChannelSetup } from "@/lib/types";

export function CredentialsPanel({ setup }: { setup: ChannelSetup }) {
  return (
    <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
      <p className="mb-1 text-sm font-semibold text-emerald-900">Channel created — copy these now</p>
      <p className="mb-3 text-xs text-emerald-800">{setup.instructions} The secret is shown once.</p>
      <div className="space-y-3">
        {Object.entries(setup.fields).map(([label, value]) => (
          <CopyField key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Actions return the setup bundle**

Replace `app/(main)/channels/actions.ts`:
```ts
"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import type { ChannelSetup } from "@/lib/types";

export type ChannelActionState = { setup?: ChannelSetup; error?: string };

export async function createChannelAction(_prev: ChannelActionState, formData: FormData): Promise<ChannelActionState> {
  try {
    const res = await api.createChannel({
      type: String(formData.get("type")),
      label: String(formData.get("label") || "") || undefined,
    });
    revalidatePath("/channels");
    return { setup: res.setup as ChannelSetup };
  } catch {
    return { error: "Could not create the channel." };
  }
}

export async function regenerateAction(_prev: ChannelActionState, formData: FormData): Promise<ChannelActionState> {
  try {
    const res = await api.regenerateChannelSecret(String(formData.get("id")));
    return { setup: res.setup as ChannelSetup };
  } catch {
    return { error: "Could not rotate the secret." };
  }
}

export async function toggleChannelAction(id: string, active: boolean) {
  await api.updateChannel(id, { active });
  revalidatePath("/channels");
}

export async function deleteChannelAction(id: string) {
  await api.deleteChannel(id);
  revalidatePath("/channels");
}
```

- [ ] **Step 3: ChannelForm shows the credentials once**

Replace `app/(main)/channels/ChannelForm.tsx`:
```tsx
"use client";
import { useActionState, useState } from "react";
import { createChannelAction, type ChannelActionState } from "./actions";
import { CredentialsPanel } from "@/components/CredentialsPanel";

const TYPES = ["email", "efax", "sftp", "fhir", "hl7", "secure_msg"];
const COST: Record<string, string> = { email: "1", efax: "3–5/page", sftp: "1", fhir: "1", hl7: "1", secure_msg: "2" };

export function ChannelForm() {
  const [type, setType] = useState("email");
  const [state, action, pending] = useActionState<ChannelActionState, FormData>(createChannelAction, {});
  return (
    <div className="space-y-4">
      <form action={action} className="grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end">
        <label className="text-sm">Type
          <select name="type" value={type} onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="text-sm md:col-span-2">Label
          <input name="label" placeholder="Front desk fax"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <button type="submit" disabled={pending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-300">
          {pending ? "Creating…" : "Create channel"}
        </button>
        <p className="text-xs text-slate-500 md:col-span-4">
          We generate the incoming address & secret for you. Cost per document on this channel: <strong>{COST[type]}</strong> credit(s).
        </p>
      </form>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.setup && <CredentialsPanel setup={state.setup} />}
    </div>
  );
}
```

- [ ] **Step 4: Per-row rotate-secret**

`app/(main)/channels/RegenerateSecret.tsx`:
```tsx
"use client";
import { useActionState } from "react";
import { regenerateAction, type ChannelActionState } from "./actions";
import { CredentialsPanel } from "@/components/CredentialsPanel";

export function RegenerateSecret({ id }: { id: string }) {
  const [state, action] = useActionState<ChannelActionState, FormData>(regenerateAction, {});
  return (
    <div>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
          Rotate secret
        </button>
      </form>
      {state.setup && <div className="mt-2"><CredentialsPanel setup={state.setup} /></div>}
    </div>
  );
}
```
In `app/(main)/channels/page.tsx`, import `RegenerateSecret` and render `<RegenerateSecret id={c.id} />` in the actions cell of each channel row (next to Pause/Delete), behind the existing `canManage` check.

- [ ] **Step 5: Verify + commit**

Run (backend running, logged in): open `/channels`, create an `email` channel → the generated forwarding address + signing secret appear with copy buttons; create an `efax` channel → webhook URL + HMAC secret appear; rotate a secret → a new one appears.
```bash
git add components/CredentialsPanel.tsx "app/(main)/channels"
git commit -m "feat(web): system-generated channel credentials UX + secret rotation"
```

---

## Task 4: Matched patient name in the review table + detail

**Files:** Modify `components/ReviewTable.tsx`, `tests/reviewTable.test.tsx`, `app/(main)/review/[id]/page.tsx`

- [ ] **Step 1: Update the ReviewTable test**

In `tests/reviewTable.test.tsx`, add `matched_patient` to the fixture items and assert the name renders. Add to the first item: `matched_patient: { id: "p1", first_name: "Jane", last_name: "Doe", dob: "1990-05-01" }` and to the second: `matched_patient: null`. Add a test:
```tsx
test("shows the matched patient name, not a uuid", () => {
  render(<ReviewTable items={items} />);
  expect(screen.getByText(/Doe, Jane/)).toBeTruthy();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/reviewTable.test.tsx`
Expected: FAIL (name not rendered yet; also TS error until the fixture has `matched_patient`).

- [ ] **Step 3: Render the name in ReviewTable**

In `components/ReviewTable.tsx`, add a “Patient” cell. In the header row add `<th className="p-2">Patient</th>` (before Summary), and in each row add:
```tsx
            <td className="p-2 text-slate-700">
              {i.matched_patient ? `${i.matched_patient.last_name}, ${i.matched_patient.first_name}` : "—"}
            </td>
```

- [ ] **Step 4: Detail page shows the name**

In `app/(main)/review/[id]/page.tsx`, replace the “Matched patient” block (the one rendering `doc.matched_patient_id`) with:
```tsx
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Matched patient:</span>
          <span className="text-sm font-medium text-slate-900">
            {doc.matched_patient
              ? `${doc.matched_patient.last_name}, ${doc.matched_patient.first_name}${doc.matched_patient.dob ? ` (${doc.matched_patient.dob})` : ""}`
              : "— none —"}
          </span>
          {doc.match_confidence != null && (
            <Badge tone={doc.match_confidence >= 80 ? "ok" : "warn"}>{doc.match_confidence.toFixed(0)}% conf</Badge>
          )}
        </div>
```

- [ ] **Step 5: Run + commit**
```bash
npx vitest run tests/reviewTable.test.tsx   # → PASS
git add components/ReviewTable.tsx tests/reviewTable.test.tsx "app/(main)/review/[id]/page.tsx"
git commit -m "feat(web): show matched patient name instead of uuid"
```

---

## Task 5: Change document type (without filing) + audit trail panel

**Files:** Modify `app/(main)/review/[id]/actions.ts`, `app/(main)/review/[id]/page.tsx`

- [ ] **Step 1: Action**

Append to `app/(main)/review/[id]/actions.ts`:
```ts
export async function changeTypeAction(id: string, formData: FormData) {
  await api.updateDoc(id, { doc_type: String(formData.get("doc_type")) });
  revalidatePath(`/review/${id}`);
}
```
(`revalidatePath` and `api` are already imported in this file.)

- [ ] **Step 2: Change-type control + audit panel on the detail page**

In `app/(main)/review/[id]/page.tsx`: fetch the audit trail alongside the doc, import the action, and render a type `<select>` and an audit list.

At the top of the component, replace `const doc = await api.getReview(id);` with:
```tsx
  const [doc, audit] = await Promise.all([api.getReview(id), api.getAudit(id)]);
```
Add the import:
```tsx
import { changeTypeAction } from "./actions";
```
Below the matched-patient block (before “Confirm & file”), add the change-type form:
```tsx
        <form action={changeTypeAction.bind(null, doc.id)} className="flex items-end gap-2">
          <label className="text-sm">Document type
            <select name="doc_type" defaultValue={doc.doc_type ?? "other"}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {["pathology", "radiology", "specialist_letter", "discharge_summary", "referral", "other"].map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="secondary">Save type</Button>
        </form>
```
After the “Reassign patient” card, add the audit trail:
```tsx
        <Card padding="p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">Audit trail</p>
          <ol className="space-y-1 text-xs text-slate-600">
            {audit.length === 0 && <li className="text-slate-400">No events yet.</li>}
            {audit.map((e) => (
              <li key={e.id} className="flex justify-between gap-2">
                <span><span className="font-medium text-slate-800">{e.event_type}</span> · {e.actor}</span>
                <span className="text-slate-400">{new Date(e.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ol>
        </Card>
```

- [ ] **Step 3: Commit**
```bash
git add "app/(main)/review/[id]"
git commit -m "feat(web): change document type + audit-trail panel on detail"
```

---

## Task 6: Roster manual add / edit / delete

**Files:** Create `app/(main)/roster/AddPatient.tsx`, `app/(main)/roster/PatientRow.tsx`; Modify `app/(main)/roster/actions.ts`, `app/(main)/roster/page.tsx`

- [ ] **Step 1: Actions**

Append to `app/(main)/roster/actions.ts` (it already has `"use server"` and imports `api`; add `revalidatePath` if missing):
```ts
import { revalidatePath } from "next/cache";

export async function addPatientAction(formData: FormData) {
  await api.createPatient({
    first_name: String(formData.get("first_name")),
    last_name: String(formData.get("last_name")),
    dob: String(formData.get("dob") || "") || null,
    medicare_number: String(formData.get("medicare_number") || "") || null,
  });
  revalidatePath("/roster");
}

export async function updatePatientAction(id: string, formData: FormData) {
  await api.updatePatient(id, {
    first_name: String(formData.get("first_name")),
    last_name: String(formData.get("last_name")),
    dob: String(formData.get("dob") || "") || null,
    medicare_number: String(formData.get("medicare_number") || "") || null,
  });
  revalidatePath("/roster");
}

export async function deletePatientAction(id: string) {
  await api.deletePatient(id);
  revalidatePath("/roster");
}
```

- [ ] **Step 2: Add-patient form**

`app/(main)/roster/AddPatient.tsx`:
```tsx
"use client";
import { useRef } from "react";
import { addPatientAction } from "./actions";

export function AddPatient() {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} action={async (fd) => { await addPatientAction(fd); ref.current?.reset(); }}
      className="grid grid-cols-2 gap-2 md:grid-cols-5 md:items-end">
      <input name="first_name" required placeholder="First name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input name="last_name" required placeholder="Last name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input name="dob" type="date" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input name="medicare_number" placeholder="Medicare" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Add patient</button>
    </form>
  );
}
```

- [ ] **Step 3: Editable/deletable row**

`app/(main)/roster/PatientRow.tsx`:
```tsx
"use client";
import { useState } from "react";
import type { Patient } from "@/lib/types";
import { updatePatientAction, deletePatientAction } from "./actions";

export function PatientRow({ p }: { p: Patient }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <tr className="border-b border-slate-100 bg-amber-50">
        <td colSpan={5} className="px-4 py-3">
          <form action={async (fd) => { await updatePatientAction(p.id, fd); setEditing(false); }}
            className="grid grid-cols-2 gap-2 md:grid-cols-5 md:items-end">
            <input name="first_name" defaultValue={p.first_name} className="rounded border border-slate-300 px-2 py-1 text-sm" />
            <input name="last_name" defaultValue={p.last_name} className="rounded border border-slate-300 px-2 py-1 text-sm" />
            <input name="dob" type="date" defaultValue={p.dob ?? ""} className="rounded border border-slate-300 px-2 py-1 text-sm" />
            <input name="medicare_number" defaultValue={p.medicare_number ?? ""} className="rounded border border-slate-300 px-2 py-1 text-sm" />
            <span className="flex gap-2">
              <button type="submit" className="rounded bg-indigo-600 px-3 py-1 text-xs text-white">Save</button>
              <button type="button" onClick={() => setEditing(false)} className="rounded border px-3 py-1 text-xs">Cancel</button>
            </span>
          </form>
        </td>
      </tr>
    );
  }
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-4 py-3 text-slate-700">{p.last_name}</td>
      <td className="px-4 py-3 text-slate-700">{p.first_name}</td>
      <td className="px-4 py-3 text-slate-700">{p.dob ?? "—"}</td>
      <td className="px-4 py-3 font-mono text-xs text-slate-700">{p.medicare_number ?? "—"}</td>
      <td className="flex gap-2 px-4 py-3">
        <button onClick={() => setEditing(true)} className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">Edit</button>
        <form action={deletePatientAction.bind(null, p.id)}>
          <button type="submit" className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50">Delete</button>
        </form>
      </td>
    </tr>
  );
}
```

- [ ] **Step 4: Wire into the roster page**

In `app/(main)/roster/page.tsx`: import `AddPatient` and `PatientRow`; render `<AddPatient />` in a card above the table; add a trailing `<th></th>` to the table header; and replace the `patients.map(...)` row body with `{patients.map((p) => <PatientRow key={p.id} p={p} />)}`. Widen the section to `max-w-4xl` so the extra column fits.

- [ ] **Step 5: Commit**
```bash
git add "app/(main)/roster"
git commit -m "feat(web): manual roster add/edit/delete"
```

---

## Task 7: Settings — update display name

**Files:** Modify `app/(main)/settings/actions.ts`, `app/(main)/settings/page.tsx`

- [ ] **Step 1: Action**

Append to `app/(main)/settings/actions.ts`:
```ts
export async function updateNameAction(_prev: { ok?: boolean; error?: string }, formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name cannot be empty." };
  try { await api.updateProfile(name); return { ok: true }; }
  catch { return { error: "Could not update your name." }; }
}
```

- [ ] **Step 2: Form on the settings page**

In `app/(main)/settings/page.tsx` (already a client component using `useActionState`), import `updateNameAction`, add a second `useActionState`, and render a “Profile” card above the password card:
```tsx
import { changePasswordAction } from "./actions"; // existing
import { updateNameAction } from "./actions";
// inside the component:
const [nameState, nameAction, namePending] = useActionState(updateNameAction, {});
```
```tsx
      <Card padding="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Display name</h2>
        <form action={nameAction} className="space-y-3">
          <FormField label="Name">
            <input name="name" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </FormField>
          {nameState.error && <p className="text-sm text-red-600">{nameState.error}</p>}
          {nameState.ok && <p className="text-sm text-emerald-600">Name updated.</p>}
          <Button type="submit" variant="primary" disabled={namePending}>{namePending ? "Saving…" : "Save name"}</Button>
        </form>
      </Card>
```

- [ ] **Step 3: Commit**
```bash
git add "app/(main)/settings"
git commit -m "feat(web): update display name in settings"
```

---

## Task 8: Verify + README

- [ ] **Step 1: Component tests + clean build**

Run: `npm test` (Vitest — `copyField`, `reviewTable`, existing) → all green.
Run: `rm -rf .next && BACKEND_URL=http://localhost:8000 npx next build` → compiles, type check passes.

- [ ] **Step 2: README**

Update `README.md`: channels are provisioned by the system (credentials shown once on create + rotate-secret), the roster page supports manual add/edit/delete, review screens show the matched patient by name, the detail page can change document type and shows an audit trail, and settings can update the display name.

- [ ] **Step 3: Commit**
```bash
git add README.md && git commit -m "docs(web): README for channel provisioning, roster CRUD, readable matches, audit, profile"
```

---

## Self-Review

**Coverage (against the request):**
- “Generate channel credentials, not the user” → Tasks 2–3 (system-minted address+secret shown once, copy buttons, rotate).
- “Roster manual add/update/delete” → Task 6.
- “Matched patient — show something readable, not the UUID” → Task 4 (table + detail).
- “…and so on” → change document type without filing (Task 5), document audit trail (Task 5), update display name (Task 7).

**Type consistency:** `MatchedPatient`/`AuditEvent`/`ChannelSetup` (Task 1) are consumed by `ReviewTable` + detail (Task 4), the audit panel (Task 5), and `CredentialsPanel` (Task 3). `ChannelActionState { setup?, error? }` (Task 3) is the state type for both `createChannelAction` and `regenerateAction` and their `useActionState` call sites. Roster actions `addPatientAction`/`updatePatientAction(id, …)`/`deletePatientAction(id)` (Task 6) match `AddPatient`/`PatientRow` bindings. `api.updateDoc`/`getAudit`/`updateProfile` (Task 1) match their callers in Tasks 5/7.

**Placeholder scan:** every component, action, and page has complete code. The two places that edit an existing file in-line (settings page, roster page, channels page) state exactly what to import and where to render.

**Security:** credentials are returned by the server action and rendered client-side once; the secret is never persisted in the browser or re-fetched (the list endpoint exposes only `hasWebhookSecret`). The JWT/API key remains server-side (unchanged).

**Deferred (excluded by request):** PMS, email verification, production/ops.
