# Shirtify — Build Phases

The ordered plan. **Backend is built once and complete (Phase 1); the frontend
is built progressively on top of that stable API (Phases 2+).** Phase 0 is the
foundation/rebrand. Phases are sequential; we pause for review after each.

Why this order: the backend is the contract everything else stands on. Once the
whole API exists and is contract-tested, each frontend slice is small, isolated,
and **testable against a real running backend** — no stubbing, no half-built
endpoints. We're **not touching design** in these phases — frontend slices consume
the existing `@shirtify/ui` primitives as-is; the design system is out of scope here.

See the full architecture in [shirtify-build-plan.md](./shirtify-build-plan.md).
Quick recap:

- **Monorepo:** this TS pnpm/Nx template. Backend = Express `main-backend`.
- **Product:** multi-tenant SaaS. A seller sends a customer a link (or shares a
  public storefront); the customer designs a shirt in the browser and submits it;
  the seller downloads the result. Orders/payments stay on WhatsApp. **She is
  seller #1** (seeded), not the only seller.
- **Two customer "ins" → one inbox:** per-customer **custom link** (`/c/:token`)
  and permanent **public storefront** (`/s/:slug`, cold walk-in creates a session).
- **Customer canvas:** `apps/web` hosts the design surface. The editor itself lives
  in **`packages/canvas`** — an isolated Konva module with a `mount()` API and zero
  app knowledge (router/auth/EP), so it can later become a runtime remote or an
  embeddable widget without a rewrite.
- **Dashboard:** `apps/admin-web`, JWT auth. Inbox, session detail, brand,
  exports. (No live in-progress preview — the seller sees a design once it's
  submitted. Autosave still persists customer work across reloads.)
- **Database:** MongoDB via **Mongoose behind hand-written Repository ports** —
  services depend on interfaces, Mongoose never leaks into business logic; swapping
  DB later = new adapter. Tests use `mongodb-memory-server`.
- **Validation:** **Zod end-to-end** — one schema source in `@shirtify/core` feeds
  frontend types + backend boundary parsing.
- **Storage:** images via the external file-service
  (`go-file-service-production.up.railway.app`) → R2. Frontend uploads direct via
  presigned URI; **backend stores only the file `key`** (never the URI, never bytes).
- **Auth:** real seller accounts, email/password + JWT (template auth built out).
- **HTTP:** ky client (`@shirtify/api`) + TanStack Query for cache/state.
- **AI:** **post-MVP.** No AI code/deps/UI ships now; a clean seam is reserved.

---

## Phase 0 — Rebrand + foundation

**Goal:** turn the untouched template into the Shirtify project and stand up the
shared seams the backend will build on, so Phase 1 starts on clean ground.

**Scope:**
- Rename package scope `@repo/*` → `@shirtify/*` across all `package.json`,
  workspace deps, `tsconfig.base.json` paths, Vite aliases (incl. regex forms),
  and source imports. Set root `package.json` `name` to `shirtify`.
- Update `README.md`, `docs/rules.md`, `docs/run.md` references.
- Delete placeholders: `example` feature (backend + web), `User` / `ExampleItem`
  stub types, `ROUTES.EXAMPLE*`, `EP.EXAMPLE*`, placeholder home/website copy.
- `@shirtify/core`: Zod schemas + inferred types for the domain (`Seller`,
  `Session`, `Design`, `Asset`) and the **`Scene` canvas schema** (plan §4);
  curated fonts / shirt-colour set / shirt-type presets; `ROUTES`.
- DB: wire **MongoDB + Mongoose** with the Repository **ports** (`SellerRepo`,
  `SessionRepo`, `DesignRepo`, `AssetRepo`) and their Mongo adapter impls; Mongo
  connection in `env.ts`; `mongodb-memory-server` for tests.
- Storage: `FileService` client (R2 presigned-URL flow) in `@shirtify/api`.
- `packages/canvas` shell: package scaffold + `mount()`/`<DesignCanvas>` API
  signature stub (no editor logic yet) + dependency on the shared `Scene` schema.
- Add **meemaw** to `@shirtify/ui` re-export. _(Wiring only — no design changes.)_
- Seed seller #1 (her). `pnpm install` to refresh the lockfile.

**Surfaces:** monorepo wiring, `@shirtify/core`, `@shirtify/api`,
`packages/canvas` (shell), `main-backend` (DB only).

**Done when:**
- [ ] `@repo` appears nowhere (`grep -r '@repo' --include='*.{ts,tsx,json,mjs}'` clean).
- [ ] No `example` / `ExampleItem` references remain.
- [ ] Mongo connects; Repository ports + Mongo adapters typecheck; seed seller exists.
- [ ] `FileService` client compiles against the documented R2 contract.
- [ ] `pnpm exec nx run-many -t typecheck` and `-t build` pass.

---

## Phase 1 — The entire MVP backend (built once, contract-tested)

**Goal:** implement **every endpoint the whole MVP needs**, in one phase, behind
the Repository ports with Zod validation and contract tests. After this, the API
is complete and stable; all frontend phases build against a real running backend.

**Scope — all routes (`asyncHandler` + `ResponseUtil` + Zod + ports, registered in
order in `app.ts`):**

- **Auth (seller):** `POST /auth/register | login | refresh`, `POST /auth/logout`,
  `GET /me`. JWT access/refresh, password hashing, auth middleware. Self-serve
  signup; she = seeded seller #1.
- **Sessions (seller, auth):** `POST /sessions` (generate 8-char base62 token +
  link), `GET /sessions?cursor=&status=` (cursor-paginated inbox),
  `GET /sessions/:id` (session + design), `PATCH /sessions/:id` (archive).
- **Public design surface (token = key, no auth):** `GET /c/:token`
  (session public-safe + design + brand), `PUT /c/:token/design` (debounced
  autosave of `{ canvas_front, canvas_back }`), `POST /c/:token/assets` (record an
  R2 `key` + metadata → link to a layer), `POST /c/:token/submit` (→ `submitted`).
- **Storefront (public):** `GET /s/:slug` (seller public brand + shirt presets),
  `POST /s/:slug/start` (cold walk-in → create `kind:'public'` session → return
  token). Same inbox as custom links.
- **Export (seller, auth):** `POST /sessions/:id/export` (`{ preset } | { w, h, dpi }`)
  → server-side **Konva replay** via `node-canvas` → transparent PNG → upload to R2
  → store export `key` on `design.export_keys` → return `{ key, url }`.
- **Notifications (seller, auth):** web-push subscription endpoint + send on submit;
  `wa.me` reminder-link helper.

**Cross-cutting:**
- All bodies/responses validated by the shared `@shirtify/core` Zod schemas.
- **Contract test per handler** (parse the response through the shared schema; assert
  no throw) — the most valuable tests at the seam.
- Integration tests via `mongodb-memory-server`, truncating collections between tests.
- The export's `node-canvas` font loading + R2 image fetch proven here.

**Surfaces:** `main-backend`, `@shirtify/core`, `@shirtify/api` (types/EP), plus the
server-side reuse of the `packages/canvas` Scene schema for export.

**Done when (testable as an API — REST client / test suite, no UI):**
- [ ] Every endpoint above returns the documented shape; auth gates the seller routes;
      token gates the public routes.
- [ ] Full happy path works via a REST client: register/login → create session →
      `GET /c/:token` → autosave → add asset → submit → `GET /sessions/:id` shows
      submitted → export returns a transparent PNG.
- [ ] Storefront `POST /s/:slug/start` mints a public session reachable at `/c/:token`.
- [ ] Contract + integration tests green; typecheck + lint + build pass.
- [ ] **Backend QA handoff** doc produced (endpoints, RBAC, edge cases, seed users).

---

## Phase 2 — Frontend: seller auth

**Goal:** first frontend slice. A seller can sign up / log in against the real
backend and land in a (shell) dashboard. _(Uses existing `@shirtify/ui` primitives —
no design work.)_

**Scope (`apps/admin-web` + `@shirtify/api`):**
- Auth react-query hooks (`useLogin`, `useRegister`, `useMe`) hitting `EP.AUTH_*`.
- Token storage + ky 401-refresh wired; `AuthProvider` (Context + `useState`).
- Login + signup screens; `AuthGuard`; logout.
- Dashboard shell that renders `GET /me` (proves the authed call end-to-end).

**Done when (test by hand):**
- [ ] Sign up a fresh seller and log in as the seeded seller; protected route gated;
      refresh keeps the session alive; logout clears it.
- [ ] Typecheck + build pass.

---

## Phase 3 — Frontend: sessions (inbox + mint a link)

**Goal:** the seller creates a customer session and gets a real shareable link.

**Scope (`apps/admin-web` + `@shirtify/api`):**
- Sessions hooks (`useSessions` cursor list, `useSession`, `useCreateSession`,
  `useArchiveSession`).
- **Inbox** (customer name, shirt type, status, dates; status filter; cursor paging).
- **"New session" form** (customer name, shirt type/colour, allowed colours, price,
  notes) → on success shows the generated `/c/:token` link + copy button.
- Session-detail shell (info/notes/status; design render comes in Phase 5).

**Done when (test by hand):**
- [ ] Create a session → a real `/c/:token` link appears with a working copy button.
- [ ] Inbox lists it; status filter + pagination work; archive works.
- [ ] Typecheck + build pass.

---

## Phase 4 — Frontend: customer canvas (text) ← the heart

**Goal:** the most important surface. Using a link from Phase 3, a customer opens it
on a phone and designs a shirt with **text**, smoothly, and it autosaves.

**Scope (`packages/canvas` + `apps/web` + `@shirtify/api`):**
- `packages/canvas` editing surface: Konva stage, shirt mockup (front), **text tool**
  (12 fonts, colour, stroke toggle + colour + width, shadow), drag/scale/rotate via
  Konva `Transformer`, layer panel (select + z-order), **front/back** toggle,
  **colour tool** (base shirt colour when allowed). Implements the
  `mount()`/`<DesignCanvas>` contract; **zero app knowledge** (no router/auth/EP).
- Touch-first: pinch-scale, touch-drag, rotate handle; right rail collapses on mobile;
  bottom action bar (Text · Image(disabled) · AI(disabled) · Colour · Done).
- `apps/web` host: `/c/:token` route + screen, loads the session via `GET /c/:token`,
  supplies `resolveAssetUrl` (R2 view URI) + `onChange` → debounced `PUT .../design`.
- **Mobile validation** on a real phone viewport early (PRD build note #3).

**Done when (test by hand):**
- [ ] Open a Phase-3 link on a phone → build a multi-layer **text** design;
      drag/scale/rotate feel good with touch; front/back works.
- [ ] Edits **autosave**; reloading `/c/:token` restores the design.
- [ ] The canvas module has **zero** app imports — verified.
- [ ] Typecheck + build pass.

---

## Phase 5 — Frontend: image upload + submit (+ seller sees it)

**Goal:** close the customer round-trip and show the result on the seller side.

**Scope (`apps/web` + `apps/admin-web`):**
- **Image upload tool** (web) via the R2 flow: `GET /get-upload-uri` → `PUT` file
  straight to storage → `POST /c/:token/assets` with the `key` → image layer
  (PNG/JPG/SVG, ≤5MB), same drag/scale/rotate controls.
- **Submit flow** (web): "Done — send to {seller}" → `POST /c/:token/submit` →
  confirmation screen, thank-you in seller voice.
- **Session detail** (admin-web): renders the **submitted** design as a read-only
  static render (not a live in-progress preview); status badge.

**Done when (test by hand):**
- [ ] Design → upload an image → submit → confirmation shows.
- [ ] Seller opens the session → status "Submitted" + the final design renders.
- [ ] Full loop works: mint link → design → submit → seller sees it.
- [ ] Typecheck + build pass.

---

## Phase 6 — Frontend: export / download

**Goal:** the seller's payoff — a usable file out of a submitted design.

**Scope (`apps/admin-web` + `@shirtify/api`):**
- Export **size picker** (presets + custom w×h/DPI) + **download button** on session
  detail, calling `POST /sessions/:id/export`; optional client-side low-res preview
  via `handle.toPNG`.

**Done when (test by hand):**
- [ ] On a submitted session, pick a preset or custom size → download a correct-size
      **transparent PNG** that matches the on-screen design.
- [ ] Re-download serves a fresh view URL.
- [ ] Typecheck + build pass.

---

## Phase 7 — Frontend: storefront + gift/brand layer

**Goal:** open the front door (cold customers, no personal link) and thread the
seller's brand through the customer-facing surfaces.

**Scope (`apps/web` + `apps/admin-web` + `apps/website`):**
- **Storefront landing** (web): `/s/:slug` → pick shirt type/colour →
  `POST /s/:slug/start` → drop into the same `/c/:token` canvas + submit flow.
- **Gift / brand layer:** business name, logo, colours, welcome voice thread through
  dashboard + customer pages + storefront; footer "Designed for {brand}";
  logo/wordmark for sellers without one (PRD §8). _(Brand values/assets, not a design-
  system rebuild.)_
- **Brand settings** + **WhatsApp reminder** button (admin-web); push opt-in.
- Marketing site (`apps/website`).

**Done when (test by hand):**
- [ ] Visit `/s/:slug` cold → design → submit → lands in the same inbox as custom
      links.
- [ ] Brand renders across customer-facing surfaces; reminder link + push work.
- [ ] Typecheck + build pass.

---

## Post-MVP — AI design layer (reserved seam, not built now)

Designed-for, not built. Drops in without disturbing existing code (plan §9):
- `Layer` image union already reserves `source: 'ai'`; the canvas renders any image
  layer identically regardless of source.
- `assets.kind: 'ai'` reserved; the asset/layer pipeline is source-agnostic.
- Future endpoints (`/c/:token/ai/generate|edit`), an `ai_jobs` collection, and the
  async 202+poll flow bolt onto the existing public surface — no change to the
  design/canvas model.
- A future `ImageProvider` port (mirroring the Repository-port pattern) keeps any AI
  vendor behind an interface. Provider decision (e.g. gpt-image-1) deferred to then.

---

## Open decisions to confirm before/within each phase

- **Rebrand scope:** `@repo` → `@shirtify` and delete placeholders. _[Phase 0 — needs your OK]_
- **Seeded seller credentials / her real brand assets:** name, logo, colours,
  welcome voice. _[Phase 0 placeholder, real values by Phase 7]_
- **Design system:** out of scope for these phases — frontend consumes existing
  `@shirtify/ui` primitives. A dedicated design pass is a separate track. _[separate]_
- **Canvas module tier:** Tier-1 (build-time package) now; revisit Tier-2 (runtime
  remote) / Tier-3 (embed) only when a second consumer appears. _[review]_
- **Export presets / custom-size UI:** confirm the preset list. _[Phase 1 backend / Phase 6 UI]_
- **Notifications:** web push only, or push + email on submit. _[Phase 1 / Phase 7]_
- **Live in-progress preview:** cut for MVP (seller sees a design only once
  submitted). _[post-MVP]_
- **Hosting / deploy target** for backend + Mongo (Railway alongside file-service?).
  _[before launch]_
