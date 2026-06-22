# Frontend Implementation Plan — Channel Provisioning UX (Next.js)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **HOW TO FOLLOW THIS PLAN (read first).**
> This plan **adjusts the channels UI** to the new provisioning model in the backend (`2026-06-21-channel-provisioning-backend.md`). The clinic no longer wires their own provider: on create, the backend returns the **real incoming address (email) or a real fax number (fax)** — and **no customer-facing secret** for those types. The UI must:
> - Present the returned address/number as a **permanent detail** (not a "copy-once secret") for email and fax.
> - Still present **URL + bearer token** for fhir/hl7/secure_msg, and **host/user/password** for sftp.
> - **Only offer "rotate secret"** for token/sftp channels (email/fax have no rotatable customer secret — the backend rejects it).
> - **Confirm before deleting a fax channel** (deletion releases the phone number upstream — irreversible).
>
> **What does NOT change:** the create response is still `{ ...channel, setup }` with `setup.fields` (a `Record<string,string>`), so `CredentialsPanel` keeps rendering fields generically. `lib/types.ts` `ChannelSetup` is unchanged. This is a presentation update, not a data-shape change.
>
> **Prerequisite:** the channel-provisioning backend plan is built and running.
>
> **Supersedes:** the channel-credentials parts of `2026-06-21-feature-completion-frontend.md` (Task 3) where they assumed every type shows a one-time secret.

## File structure (what changes)

```
components/CredentialsPanel.tsx          (mod) — heading/warning adapts: permanent address vs one-time secret
app/(main)/channels/page.tsx             (mod) — show address/number clearly; gate rotate-secret; per-type delete
app/(main)/channels/RegenerateSecret.tsx (mod) — only rendered for token/sftp (no behaviour change inside)
app/(main)/channels/DeleteChannel.tsx    (new) — client delete button with a fax-specific confirm
app/(main)/channels/actions.ts           (mod) — deleteChannelAction stays; no shape change
tests/credentialsPanel.test.tsx          (new) — panel copy switches on secret presence
```

A tiny shared helper decides per-type behaviour:

```
SECRET_TYPES = ["fhir", "hl7", "secure_msg", "sftp"]   // have a rotatable customer secret
PROVISIONED_TYPES = ["email", "efax"]                  // show a permanent address/number, no secret
```

---

## Task 1: CredentialsPanel adapts to permanent address vs one-time secret

**Files:** Modify `components/CredentialsPanel.tsx`; Create `tests/credentialsPanel.test.tsx`

A panel that contains a secret field (`Signing secret`, `HMAC secret`, `Bearer token`, `Password`) must warn "copy now, shown once". A panel with only an address/number (email/fax) is a **permanent** detail — no scary one-time warning.

- [ ] **Step 1: Failing test**

`tests/credentialsPanel.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { CredentialsPanel } from "@/components/CredentialsPanel";

test("permanent detail (no secret) → no one-time warning", () => {
  render(<CredentialsPanel setup={{ kind: "email", instructions: "Forward here.", fields: { "Forwarding address": "docs-a@incoming.test" } }} />);
  expect(screen.getByText("docs-a@incoming.test")).toBeTruthy();
  expect(screen.queryByText(/shown once/i)).toBeNull();
});

test("contains a secret → shows the one-time warning", () => {
  render(<CredentialsPanel setup={{ kind: "hl7", instructions: "POST here.", fields: { "Endpoint URL": "https://x/y", "Bearer token": "tok_abc" } }} />);
  expect(screen.getByText(/shown once/i)).toBeTruthy();
});
```

- [ ] **Step 2: Run it red**

Run: `npx vitest run tests/credentialsPanel.test.tsx` → FAIL (current panel always says "shown once").

- [ ] **Step 3: Implement**

Replace `components/CredentialsPanel.tsx`:
```tsx
import { CopyField } from "./CopyField";
import type { ChannelSetup } from "@/lib/types";

const SECRET_LABELS = ["Signing secret", "HMAC secret", "Bearer token", "Password"];

export function CredentialsPanel({ setup }: { setup: ChannelSetup }) {
  const hasSecret = Object.keys(setup.fields).some((k) => SECRET_LABELS.includes(k));
  return (
    <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
      <p className="mb-1 text-sm font-semibold text-emerald-900">
        {hasSecret ? "Channel created — copy the secret now" : "Channel ready"}
      </p>
      <p className="mb-3 text-xs text-emerald-800">
        {setup.instructions}{hasSecret ? " The secret is shown once." : ""}
      </p>
      <div className="space-y-3">
        {Object.entries(setup.fields).map(([label, value]) => (
          <CopyField key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run green + commit**
```bash
npx vitest run tests/credentialsPanel.test.tsx   # → PASS
git add components/CredentialsPanel.tsx tests/credentialsPanel.test.tsx
git commit -m "feat(web): credentials panel distinguishes permanent address from one-time secret"
```

---

## Task 2: Per-type delete (confirm releasing a fax number)

**Files:** Create `app/(main)/channels/DeleteChannel.tsx`

Deleting a fax channel releases the phone number upstream — make that explicit with a confirm; other types delete quietly.

- [ ] **Step 1: Implement**

`app/(main)/channels/DeleteChannel.tsx`:
```tsx
"use client";
import { deleteChannelAction } from "./actions";

export function DeleteChannel({ id, type }: { id: string; type: string }) {
  const warn = type === "efax"
    ? "Delete this fax channel? The phone number will be released and cannot be recovered."
    : "Delete this channel?";
  return (
    <form action={deleteChannelAction.bind(null, id)}
      onSubmit={(e) => { if (!confirm(warn)) e.preventDefault(); }}>
      <button type="submit" className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50">
        Delete
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add "app/(main)/channels/DeleteChannel.tsx"
git commit -m "feat(web): per-type channel delete with fax-number release confirm"
```

---

## Task 3: Channels page — show the address/number, gate rotate-secret

**Files:** Modify `app/(main)/channels/page.tsx`

- [ ] **Step 1: Update the page**

In `app/(main)/channels/page.tsx`:
1. Import the new delete button and drop the inline delete form: `import { DeleteChannel } from "./DeleteChannel";`
2. Define the gate near the top of the module:
```tsx
const SECRET_TYPES = ["fhir", "hl7", "secure_msg", "sftp"];
```
3. In the channel row, make the **address** column read as the incoming detail (it already shows `c.address`; relabel the column header from “Address” to “Incoming address / number”).
4. Replace the per-row actions cell so rotate-secret only shows for `SECRET_TYPES`, and delete uses the new component:
```tsx
                {canManage && (
                  <td className="flex items-center gap-2 px-4 py-3">
                    <form action={toggleChannelAction.bind(null, c.id, !c.active)}>
                      <Button type="submit" variant="secondary" size="sm">{c.active ? "Pause" : "Resume"}</Button>
                    </form>
                    {SECRET_TYPES.includes(c.type) && <RegenerateSecret id={c.id} />}
                    <DeleteChannel id={c.id} type={c.type} />
                  </td>
                )}
```
(Keep the existing `RegenerateSecret` import; remove the old inline `deleteChannelAction` form and any now-unused import.)

- [ ] **Step 2: Verify**

Run (backend running, logged in): open `/channels`. Create an **email** channel → panel shows the forwarding address, no "shown once" warning, and the row has no "Rotate secret". Create an **efax** channel → panel shows the fax number; deleting it asks for confirmation. Create an **hl7** channel → panel shows URL + bearer token with the one-time warning, and the row has "Rotate secret".

- [ ] **Step 3: Commit**
```bash
git add "app/(main)/channels/page.tsx"
git commit -m "feat(web): channels list shows incoming address/number; rotate-secret only for token types"
```

---

## Task 4: Verify + README

- [ ] **Step 1:** `npm test` (Vitest) → green, incl. `credentialsPanel`. Then `rm -rf .next && BACKEND_URL=http://localhost:8000 npx next build` → compiles, type check passes.

- [ ] **Step 2:** Update `README.md`: channels are provisioned by the backend — email shows a forwarding address, fax shows a dedicated number (deleting it releases the number), token types show a URL + bearer token (rotatable), sftp shows host/user/password. No webhook URL/secret is shown for email/fax (handled server-side).

- [ ] **Step 3: Commit**
```bash
git add README.md && git commit -m "docs(web): channels provisioning UX"
```

---

## Self-Review

**Coverage (against the model change):**
- Email/fax show a permanent address/number, no one-time-secret framing → Task 1.
- Fax deletion confirms (number is released) → Tasks 2–3.
- Rotate-secret offered only where a customer secret exists (token/sftp) → Task 3.
- Token/sftp still show URL+token / host+credentials with the one-time warning → Task 1 (generic field rendering + secret detection).

**Type consistency:** `CredentialsPanel` still takes `ChannelSetup` (unchanged in `lib/types.ts`); it renders `setup.fields` generically and only branches on the presence of a known secret label. `DeleteChannel` binds the existing `deleteChannelAction(id)`. `RegenerateSecret` is unchanged and merely gated by type in the page. No API or type-shape changes — the backend create response is still `{ ...channel, setup }`.

**Placeholder scan:** every component and page edit is concrete; the one in-place page edit states exactly what to import, relabel, and replace.

**Deferred (noted):** a richer per-type empty/“provisioning…” state for sftp once the AWS Transfer integration lands; showing the fax number in E.164 in the list (today the stored `address` is digits-only — format it for display if desired).
