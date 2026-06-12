# Shirtify — Build Phases

The ordered plan. **Each phase is a vertical slice** — backend + frontend
together — that ends in something you can click through and test end-to-end by
hand. Phases are sequential; we pause for review after each before the next.

Why vertical, not layered: a customer link can't exist until a seller can mint
one, and the canvas can't be reached until a link exists. So auth + session
creation come **first**, and every phase after stands on a system you can already
log into and use.

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
shared seams every later phase builds on (schemas, DB adapter, storage client,
canvas package shell) so nothing downstream is blocked on plumbing.

**Scope:**
- Rename package scope `@repo/*` → `@shirtify/*` across all `package.json`,
  workspace deps, `tsconfig.base.json` paths, Vite aliases (incl. regex forms),
  and source imports. Set root `package.json` `name` to `shirtify`.
- Update `README.md`, `docs/rules.md`, `docs/run.md` references.
- Delete placeholders: `example` feature (backend + web), `User` / `ExampleItem`
  stub types, `ROUTES.EXAMPLE*`, `EP.EXAMPLE*`, placeholder home/website copy.
- `@shirtify/core`: Zod schemas + inferred types for the domain (`Seller`,
  `Session`, `Design`, `Asset`) and the **`Scene` canvas schema** (§4 of the plan);
  curated fonts / shirt-colour set / shirt-type presets; `ROUTES`.
- DB: wire **MongoDB + Mongoose** with the Repository **ports** (`SellerRepo`,
  `SessionRepo`, `DesignRepo`, `AssetRepo`) and their Mongo adapter impls; Mongo
  connection in `env.ts`; `mongodb-memory-server` for tests.
- Storage: `FileService` client (R2 presigned-URL flow) in `@shirtify/api`.
- `packages/canvas` shell: package scaffold + `mount()`/`<DesignCanvas>` API
  signature stub (no editor logic yet) + dependency on the shared `Scene` schema.
- Add **meemaw** to `@shirtify/ui` re-export.
- Seed seller #1 (her).
- `pnpm install` to refresh the lockfile.

**Surfaces:** monorepo wiring, `@shirtify/core`, `@shirtify/api`,
`packages/canvas` (shell), `main-backend` (DB only).

**Done when:**
- [ ] `@repo` appears nowhere (`grep -r '@repo' --include='*.{ts,tsx,json,mjs}'` clean).
- [ ] No `example` / `ExampleItem` references remain.
- [ ] Mongo connects; Repository ports + Mongo adapters typecheck; seed seller exists.
- [ ] `FileService` client compiles against the documented R2 contract.
- [ ] `pnpm exec nx run-many -t typecheck` and `-t build` pass.

---

## Phase 1 — Seller logs in and mints a customer link

**Goal:** the first clickable slice. A seller can log into the dashboard, create a
customer session, and get a real shareable link. Nothing downstream is reachable
without this, so it comes first.

**Backend (`main-backend` + `@shirtify/core`):**
- Build out **auth** from the template stub: `POST /auth/register | login | refresh`,
  `POST /auth/logout`, `GET /me` — JWT access/refresh, password hashing, auth
  middleware. Self-serve signup (she = seeded first seller from Phase 0).
- **Sessions:** `POST /sessions` (generates 8-char base62 token + link),
  `GET /sessions?cursor=&status=` (cursor-paginated inbox), `GET /sessions/:id`.
  All `asyncHandler` + `ResponseUtil` + Zod parse, behind the Repository ports.
- Contract tests at the seam (Zod ↔ shared TS types).

**Frontend (`apps/admin-web` + `@shirtify/api`):**
- Auth screens (login / signup), `AuthGuard`, token storage, ky 401-refresh.
- Dashboard shell + **inbox list** (customer name, shirt type, status, dates).
- **"New session" form** (customer name, shirt type, shirt colour, allowed colours,
  price, notes) → on submit, shows the generated `/c/:token` link with a copy button.
- react-query hooks for auth + sessions.

**Done when (you can test by hand):**
- [ ] Log in as the seeded seller (and sign up a fresh seller) → JWT refresh works,
      protected routes gated.
- [ ] Create a session → a real `/c/:token` link appears with a working copy button.
- [ ] Inbox lists the session (cursor pagination, status filter).
- [ ] Contract tests green; typecheck + build pass.

---

## Phase 2 — Customer opens the link and designs with text ← the heart

**Goal:** the riskiest, most important surface (PRD: "customer experience first").
Using a link minted in Phase 1, a customer opens it on a phone and designs a shirt
with text, smoothly. We build the **`packages/canvas`** editor and the `apps/web`
host around it.

**Backend (`main-backend`):**
- `GET /c/:token` (public — returns `{ session(public-safe), design, brand }`).
- `PUT /c/:token/design` (debounced **autosave** of `{ canvas_front, canvas_back }`).
- Both Zod-parsed, behind the Repository ports; `touchActivity` on autosave.

**Frontend (`packages/canvas` + `apps/web` + `@shirtify/api`):**
- `packages/canvas` editing surface: Konva stage, shirt mockup (front), **text tool**
  (12 print-safe fonts, colour, stroke toggle + colour + width, shadow),
  drag / scale / rotate via Konva `Transformer`, layer panel (select + z-order
  reorder), **front/back** toggle, **colour tool** (change base shirt colour when the
  seller allowed options). Implements the `mount()` / `<DesignCanvas>` contract;
  **zero app knowledge** (no router/auth/EP).
- Touch-first: pinch-to-scale, touch-drag, rotate handle; right rail collapses on
  mobile; bottom action bar (Text · Image(disabled) · AI(disabled) · Colour · Done).
- `apps/web` host: `/c/:token` route + screen, loads the session, supplies
  `resolveAssetUrl` (R2 view URI) + `onChange` → debounced autosave; chrome (top bar
  "Designing for {name}", intro in seller voice).
- **Mobile validation** on a real phone viewport early (PRD build note #3).

**Done when (you can test by hand):**
- [ ] Take the link from Phase 1 → open on a phone → build a multi-layer **text**
      design; drag/scale/rotate feel good with touch; front/back works.
- [ ] Edits **autosave**; reloading `/c/:token` restores the design.
- [ ] The canvas module has **zero** app imports — verified.
- [ ] Typecheck + build pass.

---

## Phase 3 — Customer adds images and submits; seller sees it

**Goal:** close the customer round-trip. The customer uploads an image and submits;
the submission shows as "Submitted" in the seller's inbox with the final design.

**Backend (`main-backend`):**
- `POST /c/:token/assets` (records the R2 `key` + metadata → links to a layer).
- `POST /c/:token/submit` (→ status `submitted`, stamps `submitted_at`).
- `GET /sessions/:id` returns the submitted design so the dashboard can render it.
- Contract tests at the seam.

**Frontend (`apps/web` + `apps/admin-web`):**
- **Image upload tool** (web) via the R2 flow: `GET /get-upload-uri` → `PUT` file
  straight to storage → `POST /c/:token/assets` with the `key` → image layer
  (PNG/JPG/SVG, ≤5MB), same drag/scale/rotate controls.
- **Submit flow** (web): "Done — send to {seller}" → `POST /c/:token/submit` →
  confirmation screen, thank-you in seller voice.
- **Session detail** (admin-web): renders the **submitted** design (a read-only
  static render — not a live in-progress preview), status badge, archive action.

**Done when (you can test by hand):**
- [ ] Design → upload an image (only the `key` is stored backend-side) → submit.
- [ ] Seller opens the session → status is "Submitted" and the final design shows.
- [ ] Full loop works: mint link → design → submit → seller sees it.
- [ ] Contract tests green; typecheck + build pass.

> **Natural pause point:** Phases 0–3 deliver the complete core loop — seller mints
> a link, customer designs (text + image) and submits, seller sees the result.
> Worth feeling on real hardware before export and storefront.

---

## Phase 4 — Seller downloads the print file

**Goal:** the seller's payoff — a usable file out of a submitted design.

**Backend (`main-backend` + exporter):**
- `POST /sessions/:id/export` with `{ preset }` or `{ w, h, dpi }`. Presets (initial):
  `Web 1024²`, `2400×3200`, `US shirt 4500×5400 @300`, `A4 @300`, `A3 @300`, `Custom`.
- Server-side **Konva replay** via `node-canvas`: load the Scene → render layers
  (curated fonts; images via R2 view URI) at target px → transparent PNG → upload to
  R2 → store the export `key` on `design.export_keys` → return `{ key, url }`.

**Frontend (`apps/admin-web` + `@shirtify/api`):**
- Export **size picker** (presets + custom w×h/DPI) + **download button** on session
  detail; optional client-side low-res preview download via `handle.toPNG`.

**Done when (you can test by hand):**
- [ ] On a submitted session, pick a preset or custom size → download a correct-size
      **transparent PNG** that matches the on-screen design.
- [ ] Export key persisted; re-download serves a fresh view URL.
- [ ] Typecheck + build pass.

---

## Phase 5 — Public storefront ("second in") + gift/brand layer

**Goal:** open the front door (cold customers walk in without a personal link) and
add the brand polish + nudges that make it a product and a gift.

**Backend (`main-backend`):**
- **Storefront:** `GET /s/:slug` (seller public brand + shirt presets),
  `POST /s/:slug/start` (cold walk-in → creates `kind:'public'` session → returns
  token → drops into the same `/c/:token` canvas). One inbox for both ins.
- Brand fields on the seller (name, logo key, colours, voice); `wa.me` reminder link
  helper; **web push** "design submitted" subscription + send on submit.

**Frontend (`apps/web` + `apps/admin-web` + `apps/website`):**
- **Storefront landing** (web): `/s/:slug` → pick shirt type/colour → design → submit
  (reuses the Phase 2/3 canvas + submit flow).
- **Gift / brand layer:** business name, logo, colours, welcome voice thread through
  dashboard + customer pages + storefront; footer "Designed for {brand}";
  **logo/wordmark generation** for sellers without one (PRD §8).
- **Brand settings** + **WhatsApp reminder** button (admin-web); push opt-in.
- Marketing site (`apps/website`).

**Done when (you can test by hand):**
- [ ] Visit `/s/:slug` cold (no link from the seller) → design → submit → lands in
      the same inbox as custom-link submissions.
- [ ] Seller's brand renders across all customer-facing surfaces.
- [ ] Reminder link generates correctly; push fires on submit.

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
  welcome voice. _[Phase 0 placeholder, real values by Phase 5]_
- **Canvas module tier:** Tier-1 (build-time package) now; revisit Tier-2 (runtime
  remote) / Tier-3 (embed) only when a second consumer appears. _[any phase, review]_
- **Export presets / custom-size UI:** confirm the preset list. _[Phase 4]_
- **Notifications:** web push only, or push + email on submit. _[Phase 5]_
- **Live in-progress preview:** cut for MVP (seller sees a design only once
  submitted). Revisit if she wants to watch designs mid-flight. _[post-MVP]_
- **Hosting / deploy target** for backend + Mongo (Railway alongside file-service?).
  _[before launch]_
- **Phase parallelism:** a design-system pass on `@shirtify/ui` could run in
  parallel with backend work since they don't overlap. _[review]_
```
