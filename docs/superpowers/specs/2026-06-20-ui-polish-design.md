# UI Polish Design — Inbound Docs Web

**Date:** 2026-06-20  
**Status:** Approved  
**Approach:** Option A — Full design system with shared primitives

---

## Overview

Upgrade the existing minimal Tailwind UI to a polished modern SaaS aesthetic. The shell keeps a top bar (not a sidebar). Accent colour is indigo. All five key page groups get redesigned: auth, review queue, document detail, dashboard, and org management.

---

## Section 1 — Design Tokens & Global Shell

### Colour system
| Role | Token |
|---|---|
| Primary accent | `indigo-600` / hover `indigo-700` / subtle `indigo-50` |
| Surface | `white` cards on `slate-50` body |
| Border | `slate-200` |
| Text primary | `slate-900` |
| Text secondary | `slate-600` |
| Text tertiary | `slate-400` |
| Danger | `red-600` / `red-50` |
| Warning | `amber-600` / `amber-50` |
| Success | `emerald-600` / `emerald-50` |

### Typography
| Role | Class |
|---|---|
| Page title | `text-2xl font-semibold text-slate-900` |
| Section heading | `text-base font-semibold text-slate-900` |
| Body / table cell | `text-sm text-slate-700` |
| Caption / hint | `text-xs text-slate-500` |

### Cards
`rounded-xl border border-slate-200 bg-white shadow-sm` with default `p-6` padding. Used for every content block.

### Top bar
- Height: `h-14`, full-width white, `border-b border-slate-200`
- Left: "Inbound Docs" wordmark in `text-indigo-600 font-semibold`
- Centre: nav links — active gets `text-indigo-600` + bottom border `border-b-2 border-indigo-600`, inactive is `text-slate-500 hover:text-slate-900`
- Right: `text-xs text-slate-500` email, role Badge pill, `|` divider, `text-red-600` Logout button

### Button variants
| Variant | Classes |
|---|---|
| Primary | `bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2` |
| Secondary | `border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors` |
| Danger | `bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors` |
| All | `disabled:opacity-50 disabled:cursor-not-allowed` + `loading` prop shows spinner |
| Size `sm` | `px-3 py-1.5 text-xs` |

### Input style
`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`

---

## Section 2 — Shared Primitives (`components/ui/`)

All server-compatible unless noted.

### `Card`
Props: `className?`, `padding?` (default `p-6`), `children`.  
Renders: `rounded-xl border border-slate-200 bg-white shadow-sm`.

### `PageHeader`
Props: `title`, `subtitle?`, `actions?` (ReactNode, right-aligned).  
Renders: flex row with title block left, actions right. `mb-6`.

### `EmptyState`
Props: `message`, `action?` (label + href/onClick).  
Renders: centred inside a Card — subtle document SVG icon, message in `text-sm text-slate-500`, optional primary Button.

### `Button` (client component)
Props: `variant: "primary" | "secondary" | "danger"`, `size: "sm" | "md"`, `loading?`, `disabled?`, all standard button attributes.  
All existing `<button>` elements swap to this component.

### `FormField`
Props: `label`, `error?`, `children` (the input element).  
Renders: `<label>` in `text-sm font-medium text-slate-700 mb-1`, children, optional `text-xs text-red-600` error below.

---

## Section 3 — Auth Pages

**Applies to:** `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/invitations/accept`

### Layout
- No `Nav`. Full-page: `min-h-screen bg-slate-50 flex items-center justify-center p-4`
- Single centred `Card` at `max-w-sm w-full p-8`
- Auth pages move into a route group `app/(auth)/` (Next.js route groups use parenthesised names and do NOT affect URL paths — `/login`, `/signup` etc. remain unchanged)
- `app/(auth)/layout.tsx` renders only `{children}` with no `<Nav>` — completely separate from the main shell
- `app/layout.tsx` is unchanged; it only applies to routes outside `(auth)`

### Card structure (top → bottom)
1. "Inbound Docs" in `text-xl font-semibold text-indigo-600`
2. Page title in `text-lg font-semibold text-slate-900` (e.g. "Sign in")
3. Subtitle in `text-sm text-slate-500` (e.g. "Welcome back")
4. Error banner: `rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3` — shown when action returns an error
5. `FormField`-wrapped inputs with `space-y-4`
6. Full-width primary `Button`
7. Footer links in `text-sm text-slate-500` with `text-indigo-600 hover:underline` anchors

### Error handling
Auth server actions switch from throwing to returning `{ error: string } | null`. Pages use `useActionState` to surface the error banner.

---

## Section 4 — Review Queue & Document Detail

### Review queue (`/`)
- `PageHeader` title "Documents to review"; Badge counts in `actions` slot
- Table inside a `Card` with no padding (`p-0`), table fills edge-to-edge
- Header row: `bg-slate-50 border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500 px-4 py-3`
- Body rows: `border-b border-slate-100 hover:bg-slate-50 transition-colors px-4 py-3`
- Urgent rows: `border-l-4 border-l-red-500` left accent stripe (replaces `bg-red-50` wash)
- "Open" action: `Button variant="secondary" size="sm"`
- Empty state: `EmptyState` with message "No documents to review — you're all caught up."

### Document detail (`/review/[id]`)
**Left column:**
- `← Back to queue` chevron link above, `text-sm text-indigo-600`
- `Card p-0` wrapping the document image

**Right column (`Card p-6 space-y-5`):**
- Doc type `text-xl font-semibold` + urgency Badge inline
- Extracted fields: `<dl>` key-value list — `<dt>` in `text-xs text-slate-500 uppercase tracking-wide`, `<dd>` in `text-sm text-slate-900 font-medium` — one row per field, `divide-y divide-slate-100`
- Matched patient row with confidence Badge
- Full-width indigo primary `Button` "Confirm & file"
- `PatientPicker` in a sub-`Card` with heading "Reassign patient"

---

## Section 5 — Dashboard & Org Management

### Dashboard (`/dashboard`)
- `PageHeader` title "Practice dashboard", subtitle = today's date
- `grid grid-cols-2 md:grid-cols-4 gap-4` of `Stat` cards
- Each `Stat` card: `Card` with `border-t-4` accent (indigo = neutral, red = urgent, emerald = filed/auto), value `text-3xl font-bold`, label `text-sm text-slate-500`, hint `text-xs text-slate-400`
- ROI callout: `Card bg-indigo-50 border-indigo-200 text-indigo-800 text-sm` below the grid

### Org management (`/org`)
Three `Card` sections:

**1. Team members**
- `PageHeader` "Team members" inside the card
- Table with initials avatar (coloured circle, first letter, `bg-indigo-100 text-indigo-700 rounded-full w-7 h-7 text-xs font-semibold`)
- "Toggle admin" → `Button variant="secondary" size="sm"`
- "Remove" → `Button variant="danger" size="sm"`

**2. Invite a team member**
- `FormField` email input + styled `<select>` + primary `Button` "Send invite" in a flex row

**3. Machine ingestion key**
- `Card` with `border-l-4 border-l-amber-400` caution styling
- "Rotate ingestion key" → secondary Button with `text-amber-700 border-amber-300`

---

## Files Changed

### New files
```
components/ui/Card.tsx
components/ui/PageHeader.tsx
components/ui/EmptyState.tsx
components/ui/Button.tsx          — "use client"
components/ui/FormField.tsx
app/(auth)/layout.tsx             — no-Nav shell for auth pages
app/(auth)/login/page.tsx         — moved from app/login/
app/(auth)/login/actions.ts       — moved + error return
app/(auth)/signup/page.tsx        — moved from app/signup/
app/(auth)/signup/actions.ts      — moved + error return
app/(auth)/forgot-password/page.tsx
app/(auth)/forgot-password/actions.ts
app/(auth)/reset-password/page.tsx
app/(auth)/reset-password/actions.ts
app/(auth)/invitations/accept/page.tsx
app/(auth)/invitations/accept/actions.ts
```

### Deleted files (replaced by route group equivalents above)
```
app/login/
app/signup/
app/forgot-password/
app/reset-password/
app/invitations/
```

### Modified files
```
components/Nav.tsx             — new top bar styles
components/ReviewTable.tsx     — new table styles + Button
components/Stat.tsx            — border-t-4 accent + new typography
components/PatientPicker.tsx   — new input + Button styles
app/page.tsx                   — PageHeader + EmptyState
app/review/[id]/page.tsx       — dl key-value + Button + sub-card
app/dashboard/page.tsx         — Stat cards + ROI callout
app/org/page.tsx               — three-card layout + avatars + Buttons
app/org/actions.ts             — unchanged logic
app/roster/page.tsx            — PageHeader + Card
app/review/failed/page.tsx     — PageHeader + Card
app/upload/page.tsx            — Card + Button + FormField
```

### Unchanged files
```
components/Badge.tsx           — already correct, tests assert on it
lib/auth.ts · lib/api.ts · lib/types.ts · lib/format.ts
middleware.ts
app/layout.tsx                 — unaffected; (auth) group opts out automatically
```

---

## Constraints

- All existing Vitest tests must stay green (Badge and ReviewTable tests reference class names — changes are additive, not removals of existing classes the tests assert on)
- No new dependencies — Tailwind CSS 4 already provides everything needed
- `components/ui/Button.tsx` is the only new client component
