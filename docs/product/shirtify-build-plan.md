# Shirtify — Build Plan

**Status:** approved direction, pre-implementation
**Source PRD:** `dockito/projects/shirtify/prd.md`
**Owner personas:** fullstack / frontend / backend / frontend-master (dockito)

---

## 0. What Shirtify is

A multi-tenant SaaS that replaces the WhatsApp design back-and-forth for custom
t-shirt sellers. A **seller** sends a customer a link (or shares a public
storefront); the **customer** designs a shirt in the browser and submits it; the
seller picks the finished design out of her dashboard inbox and takes it to print
on her own.

Originally specced as a one-off gift for a single seller. Reframed: it is a real
product. **She is seller #1** (seeded), not the only seller. Orders, payments and
fulfilment stay on WhatsApp — Shirtify only owns the *design* step.

### Two ways a customer gets in (both land in one inbox)

1. **Custom link** — seller creates a per-customer session with pre-loaded
   context ("Tobi — birthday hoodie"), gets an unguessable 8-char link, sends it
   over WhatsApp. 1:1, private.
2. **Public storefront** — seller has a permanent public slug
   (`/s/<brand-slug>`) for her bio/DMs. A cold customer walks in, designs, and
   submits. Creates a `kind:'public'` session on the fly. 1:many.

Both produce a `session` → `design` → submission that shows in the same dashboard.

### Explicitly post-MVP (designed-for, not built now)

- **AI design generation/edit.** No AI layer is built in the MVP. The product is
  architected so AI slots in cleanly later (see §9), but there is zero AI code,
  zero OpenAI dependency, and zero AI UI in the MVP. The customer's tools are
  text, image-upload, and colour.

---

## 1. Architecture (locked)

```
apps/web        → customer design canvas host. Public entry: /c/:token and /s/:slug
apps/admin-web  → seller dashboard (JWT auth). Inbox, session detail, brand, exports
apps/website    → marketing/landing (SaaS public face) — last
main-backend    → Express API: auth, sellers, sessions, designs, assets, export
packages/core   → shared Zod schemas + inferred types, ROUTES, helpers (pure TS)
packages/api    → EP constants, ky client, react-query hooks, ApiResponse<T>
packages/ui     → AppButton/AppText/... primitives, theme, cn(), + meemaw re-export
packages/canvas → ISOLATED design-canvas module (Konva). mount() API, no app knowledge
```

| Concern | Decision |
|---|---|
| App shape | Keep template: Vite SPAs + Express API (PRD's "Next.js" treated as non-binding) |
| Canvas | **`packages/canvas`** — isolated Tier-1 module, Konva, `mount()` API, MFE/embed-ready (§3) |
| Database | **MongoDB via Mongoose, behind hand-written Repository ports** (§2). No Postgres/Drizzle. |
| Validation | **Zod end-to-end** — one schema source (`@shirtify/core`) feeds frontend types + backend boundary parsing |
| Storage | **R2 via the go-file-service** (presigned-URL proxy). Frontend uploads direct; backend stores only `key`s (§6) |
| Auth | real seller accounts, email/password + JWT (template auth built out); she = seeded seller #1 |
| Autosave | debounced PUT of canvas JSON; dashboard reads latest saved state |
| Export | preset sizes + custom `{w,h,dpi}`, on-demand, transparent PNG, server Konva replay (§7). No print-shop integration. |
| Brand | per-seller (name, logo key, colours, voice); logo generation is a gift-layer task |
| AI | **post-MVP** — not built now; clean seam reserved (§9) |
| Roadmap | customer-experience-first; dashboard + storefront later (§8) |

### Deviations from persona doctrine (flagged, intentional)

- **`ServiceResult<T>`** — the template throws `AppError` subclasses from services
  and unwraps centrally in `errorHandler.middleware.ts`. We follow template-as-built,
  *not* the persona's `ServiceResult<T>` return pattern. One error model.
- **meemaw `<Show>/<Repeat>`** — not in the template. We **add** it and use it in
  new feature code.
- **Postgres/Drizzle/Testcontainers** — personas assume SQL + Testcontainers. We use
  **MongoDB**. Integration tests run against an ephemeral Mongo
  (`mongodb-memory-server`), truncating collections between tests. Same discipline,
  different engine.
- **Cursor pagination** — kept (sessions inbox), via Mongo `_id`/`created_at` cursor.

---

## 2. Data model + DB adapter (MongoDB / Mongoose behind Repository ports)

### Swap seam

Services **never** import Mongoose. They depend on Repository **interfaces**
(ports). Mongoose lives only inside the adapter implementations.

```ts
// packages/.../repos/ports.ts  — the contract services depend on
interface SessionRepo {
  create(input: NewSession): Promise<Session>;
  byToken(token: string): Promise<Session | null>;
  byId(id: string): Promise<Session | null>;
  listBySeller(sellerId: string, q: { cursor?: string; status?: SessionStatus; limit: number }):
    Promise<{ items: Session[]; nextCursor: string | null; hasMore: boolean }>;
  patch(id: string, patch: Partial<Session>): Promise<Session>;
  touchActivity(id: string): Promise<void>;
}
// mongo/session.repo.ts — Mongoose model + mapping doc→domain lives here, nowhere else
```

Domain types are **Zod-inferred** (`@shirtify/core`). The adapter parses Mongo docs
through the Zod schema at the boundary (hard-lessons: don't trust unparsed external
data). Swapping DB later = new adapter package implementing the same ports; services
and controllers untouched.

### Collections (domain shape — Zod-defined in `@shirtify/core`)

```
sellers
  _id, email(unique), password_hash, business_name,
  public_slug(unique), brand_logo_key?, brand_colors{ primary, accent, ink, surface },
  welcome_voice, role('seller'|'admin'), created_at

sessions
  _id, seller_id, kind('custom'|'public'), token(8-char base62, unique),
  customer_name?, shirt_type('tee'|'hoodie'|'polo'|'oversized'),
  shirt_color, allowed_colors?[], price_quoted?(int minor units),
  notes?, status('in_progress'|'submitted'|'archived'),
  created_at, last_activity_at

designs
  _id, session_id(unique), canvas_front(Scene), canvas_back(Scene),
  submitted_at?, export_keys?{ [presetOrSize]: key }, updated_at

assets
  _id, seller_id?, session_id?, kind('upload'|'export'|'logo'),
  storage_key, mime, width?, height?, bytes?, created_at
```

Money stored as **integer minor units**, never float. Token = 8-char base62
(unguessable but readable, shareable — PRD §10). No `ai_jobs` collection in MVP.

---

## 3. The canvas module (`packages/canvas`) — isolated, MFE/embed-ready

**Why a module:** so the editor has a stable contract, is independently testable,
and can later ship as a runtime remote or embeddable widget **without rewrites**.

**Tier-1 now:** bundled at build time into `apps/web`. **No Module Federation tax.**
But built to a clean contract so promoting to Tier-2 (runtime remote) or Tier-3
(web-component/iframe embed) later is a *packaging* change, not a rewrite.

**Constraints that keep it isolated (enforced in review):**
- Zero knowledge of the app: no router, no auth, no `@shirtify/api`, no `EP`/`ROUTES`.
- Depends only on the **shared scene schema** (`@shirtify/core`) and Konva.
- All I/O is injected via props/callbacks — the canvas never fetches.

**Public API:**
```ts
// packages/canvas/src/index.ts
export function mount(el: HTMLElement, opts: CanvasOptions): CanvasHandle;
export interface CanvasOptions {
  scene: Scene;                       // initial front/back scene
  onChange: (scene: Scene) => void;   // fires on every edit (host debounces → autosave)
  resolveAssetUrl: (key: string) => Promise<string>;  // host supplies R2 view URL
  readOnly?: boolean;                 // dashboard live-preview uses this
}
export interface CanvasHandle {
  addTextLayer(): void; addImageLayer(key: string): void;
  setSide(side: 'front' | 'back'): void;
  getScene(): Scene; toPNG(opts): Promise<Blob>;  // client preview export
  destroy(): void;
}
// Plus a thin React wrapper <DesignCanvas {...opts} /> for apps/web.
```

The host (`apps/web`) owns data-fetching, autosave debounce, R2 URL resolution, and
chrome. The canvas owns only the editing surface. This *is* the isolation boundary.

---

## 4. Canvas JSON schema (the seam: editor ↔ autosave ↔ export)

Our own minimal Zod schema (not raw Konva node dumps) so server replay is stable
and versionable. Lives in `@shirtify/core`, shared by canvas, backend, exporter.

```ts
const Scene = z.object({
  version: z.literal(1),
  shirt: z.object({ type: ShirtType, color: z.string() }),
  layers: z.array(Layer),           // z-order = array order
});

const BaseLayer = z.object({
  id: z.string(), x: z.number(), y: z.number(),   // normalized 0..1 of print area
  scale: z.number(), rotation: z.number(), opacity: z.number(),
});
const TextLayer  = BaseLayer.extend({ kind: z.literal('text'), text: z.string(),
  font: z.string(), color: z.string(),
  stroke: z.object({ color: z.string(), width: z.number() }).optional(),
  shadow: z.boolean().optional() });
const ImageLayer = BaseLayer.extend({ kind: z.literal('image'),
  assetKey: z.string(), source: z.enum(['upload']) });  // 'ai' reserved post-MVP
const Layer = z.discriminatedUnion('kind', [TextLayer, ImageLayer]);
```

Coordinates normalized 0..1 of the print area → same JSON renders at any export size
with no rescale math. Editor maps normalized→screen px; exporter maps normalized→target px.

---

## 5. API contract (seam-first — Zod schemas in `@shirtify/core`, shared both sides)

Envelope (template): success `{ data, meta? }`, error `{ error: { code, message, field_errors? } }`.
All via `ResponseUtil`; all handlers `asyncHandler`-wrapped. Paths under `/api/v1`.
Every request/response body has a Zod schema in `@shirtify/core`; backend parses
inbound with it, frontend infers types from it. **One schema, both sides.**

### Auth (seller) — build out template stub
```
POST /auth/register  { email, business_name, password } → 201 { seller, access_token, refresh_token }
POST /auth/login     { email, password }                → 200 { seller, access_token, refresh_token }
POST /auth/refresh   { refresh_token }                  → 200 { access_token, refresh_token }
POST /auth/logout                                        → 204
GET  /me             (auth)                              → 200 { seller }
```

### Sessions (seller, auth)
```
POST  /sessions      { customer_name?, shirt_type, shirt_color, allowed_colors?, price_quoted?, notes? }
                     → 201 { session }     (token + link generated)
GET   /sessions?cursor=&status=  (auth)    → 200 { items, meta:{ nextCursor, hasMore } }
GET   /sessions/:id  (auth)                → 200 { session, design }
PATCH /sessions/:id  { status?: 'archived' } → 200 { session }
POST  /sessions/:id/export  { preset? | w,h,dpi } → 200 { key, url }   (server replay)
```

### Public design surface (no auth — token / slug is the key)
```
GET  /c/:token              → 200 { session(public-safe), design, brand }
GET  /s/:slug               → 200 { seller(public brand), shirt presets }
POST /s/:slug/start         { shirt_type, shirt_color } → 201 { token }   (cold walk-in → session)
PUT  /c/:token/design       { canvas_front, canvas_back } → 200 { design } (debounced autosave)
POST /c/:token/submit       { customer_name? } → 200 { session }           (→ submitted)
POST /c/:token/assets       { storage_key, mime, width, height, bytes } → 201 { asset }
```

**Asset upload flow (R2):** the **frontend** calls the go-file-service
`/get-upload-uri`, PUTs the file straight to storage, then POSTs the returned `key`
(+ metadata) to `/c/:token/assets`. Our backend never receives file bytes — it
records the `key` and links it to an image layer. (§6)

**Contract-drift checklist** (run at each phase boundary): field names match
schema↔type, nullable matches, pagination `nextCursor`/`hasMore` both sides, arrays
default `[]` not null, dates ISO 8601, frontend error handler keys off `error.code`.

---

## 6. Storage (R2 via go-file-service)

Base URL: `https://go-file-service-production.up.railway.app`. It is a
presigned-URL proxy — **we store credentials nowhere, and file bytes never pass
through our backend.**

- **Upload (frontend):** `GET /get-upload-uri?ext=png` → `{ key, uri }` → `PUT` file
  to `uri` → POST `key` to our `/c/:token/assets`. (URI expires 15m — fetch it right
  before upload, not at page load.)
- **View:** `GET /get-file-uri?key=...` → `{ uri }` (1h). The canvas's
  `resolveAssetUrl(key)` calls this; never cache a view URI > 1h.
- **Server-side (export):** the exporter fetches source image bytes via a view URI,
  composites, then uploads the result the same way and stores the export `key` on
  the design.
- We persist **`key`, never `uri`** (the doc's golden rule). Wrap the service in a
  small `FileService` client in `@shirtify/api` so the base URL/contract lives in
  one place.

---

## 7. Export pipeline

- Preset sizes + custom `{w,h,dpi}`; user picks. Presets (initial): `Web 1024²`,
  `2400×3200`, `US shirt 4500×5400 @300`, `A4 @300`, `A3 @300`, `Custom`.
- On demand: load design Scene → server-side Konva replay via `node-canvas` →
  render layers (curated fonts; images fetched from R2 view URI) at target px →
  transparent PNG → upload to R2 → store `key` on `design.export_keys`.
- No print-shop API, no DPI negotiation — render at the chosen size, return the PNG
  key + a fresh view URL.

---

## 8. Phased roadmap (customer-experience-first)

### Phase 0 — Foundation
- Rebrand `@repo` → `@shirtify` (CLAUDE.md checklist) + root package name.
- Add `packages/canvas` (Konva) and `packages/core` Zod schemas + inferred types.
- Wire **MongoDB + Mongoose behind Repository ports**; DB connection in env;
  `mongodb-memory-server` for tests.
- `FileService` client (R2) in `@shirtify/api`. Add meemaw to `@shirtify/ui`.
- Seed seller #1. Curated fonts/colours/shirt presets in `@shirtify/core`.
- **Done:** typecheck + build green; Mongo connects; seed seller exists.

### Phase 1 — Customer canvas (mobile-first), no AI
- `packages/canvas` editing surface: Konva stage, shirt mockup (front), text tool
  (12 print-safe fonts, colour, stroke, shadow), drag/scale/rotate via Transformer,
  layer panel, front/back, colour tool. `mount()`/`<DesignCanvas>` API.
- `apps/web` host: `/c/:token` route, loads session+design, supplies
  `resolveAssetUrl`, renders chrome. Touch gestures, collapsing panel.
- **Done:** a customer builds a text design on a phone; it renders.

### Phase 2 — Assets + autosave + submit
- Image upload tool via R2 flow (frontend → presigned PUT → POST key) → image layer.
- Debounced autosave (`PUT /c/:token/design`). Submit + confirmation screen
  (thank-you in seller's voice). Status → submitted.
- **Done:** upload works, design autosaves, submit lands a submitted session.

### Phase 3 — Seller auth + dashboard inbox
- Build out auth (register/login/refresh/me, JWT). `apps/admin-web` shell.
- Inbox (cursor list, status filter), session detail with **read-only canvas
  live-preview** (`readOnly` mount of latest saved scene), create-session form, archive.
- **Done:** seller signs up, creates a session, sees submissions live.

### Phase 4 — Export
- Server Konva replay → transparent PNG at preset/custom size → R2 → download from
  dashboard (and optionally customer preview via `handle.toPNG`).
- **Done:** seller downloads a correct-size transparent PNG of a design.

### Phase 5 — Storefront + gift layer + notifications
- Public storefront `/s/:slug` ("second in"). Brand/logo generation (gift).
- WhatsApp reminder links (`wa.me/...?text=`). Web push "design submitted".
- Marketing site (`apps/website`).
- **Done:** cold customer walks in via storefront and submits; brand threads through.

### Post-MVP — AI design layer (§9)

---

## 9. AI seam (reserved, NOT built in MVP)

We build so this drops in without disturbing existing code:
- `Layer` union reserves `source: 'ai'` on image layers; canvas already renders any
  image layer identically regardless of source.
- An `assets.kind` of `'ai'` is reserved; the asset/layer pipeline is source-agnostic.
- Future endpoints (`/c/:token/ai/generate|edit`, `ai_jobs` collection, async
  202+poll) bolt onto the existing public surface; no schema migration needed for
  the design/canvas model.
- A future `ImageProvider` port (mirroring the Repository-port pattern) keeps any AI
  vendor behind an interface.
No AI code, dependency, or UI ships in the MVP.

---

## 10. Risks tracked
- **Mobile canvas ergonomics** — Konva touch gestures (pinch-scale, drag, rotate)
  validated on a real phone viewport early in Phase 1.
- **Canvas isolation** — the no-app-knowledge constraint (§3) enforced in review;
  it's what makes the MFE/embed upgrade path real rather than aspirational.
- **Contract drift** — checklist §5 at each phase boundary; contract test per handler
  (parse response through the shared Zod schema).
- **R2 URI expiry** — never persist view URIs; fetch upload URI right before upload.
- **Persona vs template** — template-as-built (central `AppError`); Mongo not SQL;
  meemaw added. Deviations flagged §1.
```
