# Frontend QA Handoff — Phases 2–5 (Seller dashboard + Customer canvas)

**Date:** 2026-06-13
**Build:** Typecheck ✅ · Lint ✅ · Build ✅ (web · canvas) · Backend tests 30/30 ✅
**Apps under test:** `apps/web` (customer canvas **and** seller dashboard live here)
**Frontend URL:** `http://localhost:5173`
**Backend URL:** `http://localhost:9091` (must be running, with MongoDB up)

> ⚠️ **Not yet exercised in a real browser.** Typecheck/lint/build pass, which
> proves it compiles and bundles — not that gestures, autosave timing, and the
> Konva canvas behave on a real device. That's what this pass is for.

---

## Where to start: `/register`

Start at **`/register`**, not anywhere else. Every other surface depends on a
seller existing and a link being minted first:

- the **customer canvas** `/c/:token` needs a token → only exists after a session is created
- the **storefront** `/s/:slug` needs a slug → only exists after a seller account exists

Registering fresh also gives you a clean tenant with an empty inbox, so nothing
pre-seeded muddies what you observe. (You *can* instead log in as the seeded
seller `her@shirtify.app` / `changeme123` — but prefer a fresh register.)

### Setup (do this first)

```bash
# 1. MongoDB running locally (mongodb://127.0.0.1:27017/shirtify)
# 2. Backend
pnpm --filter @shirtify/main-backend dev          # → http://localhost:9091
# 3. Frontend
pnpm --filter @shirtify/web dev                   # → http://localhost:5173
```

If the backend isn't on **9091**, login/register will fail — check
`apps/web/.env` (`VITE_API_BASE_URL=http://localhost:9091`) and the backend `.env`
(`PORT=9091`).

---

## The golden path (follow in this exact order)

This sequence walks every screen in dependency order — you never hit a
"need a token first" dead end.

1. **`/register`** → create a seller → auto-redirect to **`/dashboard`** (empty inbox).
2. **`/dashboard` → "+ New session"** (`/dashboard/new`) → fill the form → submit
   → redirected to **session detail** → **copy the `/c/:token` link**.
3. **Open the copied link** in a new tab/incognito → **the canvas** → add a text
   layer, edit it, upload an image, toggle front/back → **Done** → confirm.
4. **Back to `/dashboard`** → the session now shows **Submitted** → open it →
   see the design render → **Download PNG**.
5. **Storefront ("second in"):** copy your slug from the dashboard header
   (`/s/<slug>`) → open `/s/<slug>` in a fresh tab → cold walk-in → design →
   submit → confirm it appears in the **same** inbox as a `storefront` source.

---

## SELLER DASHBOARD (auth'd)

### Register

**Route:** `/register`
**File:** `apps/web/src/features/sellers/auth/screen/register-screen.tsx`
**Gate:** `GuestOnly` — if already logged in, redirects to `/dashboard`.

Must be able to:
- see heading **"Start designing"** + subtitle.
- fill **Business name**, **Email**, **Password** (hint: "At least 8 characters.").
- submit → account created → redirect to `/dashboard`.
- a second tab opened at `/register` while logged in → bounces to `/dashboard`.

Validation / errors:
| Trigger | Expected |
|---|---|
| Empty business name / bad email / password < 8 | inline field error under that field (red mono text), no redirect |
| Email already taken | form-level error message (backend `409`) |
| (network) backend down | form-level error message, button returns to idle |

### Login

**Route:** `/login`
**File:** `apps/web/src/features/sellers/auth/screen/login-screen.tsx`
**Gate:** `GuestOnly`.

Must be able to:
- see heading **"Welcome back"**.
- log in with correct credentials → `/dashboard`.
- link "Create an account" → `/register`.

| Trigger | Expected |
|---|---|
| Wrong password / unknown email | form-level `401` message (same text either way) |
| Empty fields | inline field errors |

### Auth session behaviour (important)

- After login/register, a **page refresh keeps you logged in** (token in
  localStorage; `useMe` revalidates).
- Visiting **`/dashboard` while logged out** → redirect to `/login`
  (`AuthGuard`). While the token is validating you briefly see **skeletons**, not
  a flash of the login page.
- **Log out** (header button) → tokens cleared → redirect to `/login`; hitting
  back does not re-enter the dashboard.

### Dashboard shell (header)

**File:** `apps/web/src/features/sellers/dashboard/screen/parts/dashboard-header.tsx`

On every dashboard screen:
- "S" lime mark + "Shirtify" wordmark (links to `/dashboard`).
- right side: business name + `/s/<slug>` (mono), avatar initials, **Log out**.

### Sessions inbox

**Route:** `/dashboard`
**File:** `apps/web/src/features/sellers/sessions/screen/sessions-inbox-screen.tsx`

Must be able to:
- see heading **"Customer sessions"** + **"+ New session"** button.
- **Empty state** (fresh account): dashed box, title **"No sessions yet"**,
  description "Create a session to generate a design link…", a **New session** action.
- **Loading:** three skeleton rows (no spinner).
- with sessions: a table — **Customer · Shirt · Source · Status · Last activity**.
  - clicking a row → session detail.
  - **Source** reads `link` (custom) or `storefront` (walk-in).
  - **Status** pill: `In progress` (default) / `Submitted` (lime, with dot) / `Archived` (ink).
- **Filters:** All / In progress / Submitted / Archived — selecting one re-queries
  and resets to page 1.
- **Pagination:** create ≥ 21 sessions to test. "Previous" disabled on page 1;
  "Next" disabled on the last page; paging preserves the active filter.
- **Error state:** if the list fails, a dashed box "Couldn't load sessions" + Retry.

### New session

**Route:** `/dashboard/new`
**File:** `apps/web/src/features/sellers/sessions/screen/parts/new-session-form.tsx`

Must be able to:
- "‹ Back to sessions" link → `/dashboard`.
- fill **Customer name** (optional), **Shirt type** (select), **Price ₦** (optional,
  mono), **Shirt colour** (swatch grid — loads via `/colors`, shows skeleton first),
  **Notes** (optional).
- **Submit with no colour selected** → inline error "Pick a shirt colour".
- submit valid → redirect to the new session's detail page.
- "Cancel" → `/dashboard`.

> Colour swatches come from the seller's catalogue (8 platform colours by
> default). The price field takes naira; it's sent as kobo (×100) — verify the
> detail page shows the same number you typed.

### Session detail

**Route:** `/dashboard/sessions/:id`
**File:** `apps/web/src/features/sellers/sessions/screen/session-detail-screen.tsx`

Must be able to:
- "‹ Back to sessions" link.
- see customer name + status pill.
- **Customer link** card: read-only mono field + **Copy** button.
  - Copy → button flips to **"Copied ✓"** (~1.8s) + a **lime toast "Link copied"**.
- **Session details** card: shirt, price (if set, as `₦…`), source, created, last
  activity, your notes (if set).
- **Design outcome** panel:
  - **before submit:** dashed box "Waiting on the customer".
  - **after submit:** the design renders (front + back, read-only) + the
    **Download print file** panel.
- **Archive** button (danger, top-right; hidden when already archived):
  - opens a confirm modal "Archive this session?" → on confirm: ink toast
    "Session archived" + redirect to `/dashboard`; on cancel: nothing changes.
- **Not found:** visiting a bad/foreign id → "Session not found" empty state.

### Export / download

**File:** `apps/web/src/features/sellers/sessions/screen/parts/export-panel.tsx`
(shown on a **submitted** session)

Must be able to:
- pick **Size** (Web 1024² / Standard / US shirt / A4 / A3) and **Side** (Front/Back).
- **Download PNG ↓** → button shows loading → opens the rendered PNG in a new tab
  + lime toast "Export ready — opening download".
- the PNG should be transparent-background and match the on-screen design.
- popup blocked? the toast still fires; the URL opens in a tab (allow popups).

| Trigger | Expected toast |
|---|---|
| Export success | "Export ready — opening download" (go) |
| Export error | backend `err.message` (warn) — not a hardcoded string |

---

## CUSTOMER CANVAS (public — token is the key, no login)

### Design page

**Route:** `/c/:token`
**File:** `apps/web/src/features/design/screen/design-screen.tsx`

States on load:
- **Loading:** skeletons.
- **Bad/expired token:** "This link isn't working" empty state.
- **Already submitted:** the thank-you confirmation (not the editor).
- **Archived:** "This link is no longer active".
- **In progress:** the editor.

Top bar (`design-topbar.tsx`):
- "S" mark; "Designing for {customer}" (mono, hidden on small screens).
- **Front / Back** toggle.
- **Save status** pill appears after the first edit: "Saving…" → "Saved ✓"
  (lime). Goes "Save failed" (warn) if the backend rejects.

**Text tool** — bottom toolbar **"Text"** button:
- tapping **Text** immediately adds a text layer and selects it.
- the right rail shows the text editor: **Your text** input, **Font** picker
  (12 fonts), **Colour** swatches, **Outline** toggle (→ colour + width slider),
  **Shadow** toggle.
- editing any field updates the shirt live.
- on the shirt: **drag** to move, **corner handles** to scale, **rotate** handle.
  → **test with touch on a real phone** (pinch/drag), this is the highest-risk area.

**Image tool** — **"Image"** button:
- "Upload an image" → file picker (PNG/JPG/SVG, ≤ 5MB).
- > 5MB → warn toast "Image is too large (max 5MB)".
- valid → uploads to R2 → image appears as a layer → go toast "Image added".
- drag/scale/rotate the image the same as text.

**Colour tool** — **"Colour"** button:
- if the seller allowed multiple colours → swatch grid changes the shirt base colour.
- if only one colour → "Colour is fixed" message.

**Layers** (right rail):
- each layer row: type thumb, name, transform read (`100% · 0°`), select.
- ↑ / ↓ reorder (z-order); selected layer shows a **"Delete selected layer"** button.
- tapping empty canvas deselects.

**Front / back:**
- toggling sides swaps the canvas; layers are per-side; selection clears on switch.

**Autosave:**
- edits debounce (~1.2s) → "Saved ✓".
- **reload the page mid-design** → your design is still there (persisted).

**Submit (Done):**
- toolbar **Done** → confirm modal "Send this design to {brand}?" ("Once you send
  it, you won't be able to make more changes.") → **Send design**.
- success → **confirmation screen**: "Design sent!" + "Thanks! {brand} will be in
  touch on WhatsApp shortly to sort out your shirt." + "Designed with Shirtify · for {brand}".
- after submit, re-opening `/c/:token` shows the confirmation, not the editor.

---

## STOREFRONT (public walk-in — "second in")

### Storefront landing

**Route:** `/s/:slug`
**File:** `apps/web/src/features/storefront/screen/storefront-screen.tsx`

Must be able to:
- see the seller's brand name + welcome line.
- **bad slug** → "Shop not found" empty state.
- pick a **shirt type** + **colour**.
- **"Start designing →"** → creates a public session → redirect into `/c/:token`
  (the same canvas as above).
- complete a design + submit → confirm it lands in the seller's inbox with
  **Source = storefront**.

---

## Cross-cutting checks

| Check | Expected |
|---|---|
| Mobile layout (canvas) | right rail collapses below the canvas; toolbar thumb-reachable at the bottom |
| Toasts | appear and auto-dismiss; tones: go (success), warn (error), ink (neutral) |
| No console errors | clean console through the golden path |
| Refresh on any dashboard route | stays authed, reloads the same screen |
| 401 mid-session (e.g. expired token) | client attempts refresh; on failure → redirect to `/login` |
| Back/forward nav | browser back through dashboard ↔ detail ↔ new works without breakage |

---

## Known limitations (NOT bugs — don't file these)

- **Seller-custom shirt colours** show a grey swatch on customer/storefront pages.
  The public API returns colour **slugs**, not hexes; the client maps the 8
  platform colours but not custom ones. (Backend change needed; tracked.)
- **`website` (marketing app) does not build** — pre-existing design-system CSS
  quirk, unrelated to these phases. Out of scope.
- **Live in-progress preview** is intentionally cut — the seller sees a design
  only **after** submit (autosave still persists the customer's work).
- **AI tool** is post-MVP — there is no AI button in the toolbar.
- **`admin-web`** is the (separate) platform-admin placeholder — **not** in scope
  for this pass. All seller testing happens in `apps/web`.

---

## Seed / test accounts

| Use | Value |
|---|---|
| Fresh seller | self-register at `/register` |
| Seeded seller | `her@shirtify.app` / `changeme123` (run `pnpm --filter @shirtify/main-backend seed`) |
| Storefront slug | shown in the dashboard header after login (`/s/<slug>`) |
