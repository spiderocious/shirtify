# Shirtify API — Reference (v1)

Complete reference for the Shirtify MVP backend (`apps/main-backend`). Every
endpoint below is implemented, contract-tested, and validated end-to-end against
an in-memory MongoDB (19 integration tests, all green).

- **Base URL (dev):** `http://localhost:8081`
- **Prefix:** all routes under `/api/v1`
- **Auth:** seller routes require `Authorization: Bearer <access_token>`. Public
  customer/storefront routes are gated by the link **token** or **slug** instead.
- **Validation:** every request body is parsed with a shared Zod schema from
  `@shirtify/core` — the frontend infers its types from the same schemas.

## Response envelope

Success:
```json
{ "data": { ... }, "meta": { ... } }   // meta only on paginated lists
```
Error:
```json
{ "error": { "code": "validation_error", "message": "…", "field_errors": { "email": ["…"] } } }
```

`field_errors` appears only on `validation_error`. Clients should branch on
`error.code`, never on `error.message` (messages may change).

### Error codes → HTTP status

| code | status | when |
|---|---|---|
| `validation_error` | 400 | body/query failed Zod parse (`field_errors` included) |
| `unauthorized` | 401 | missing/invalid token, bad credentials |
| `forbidden` | 403 | authenticated but not allowed |
| `not_found` | 404 | resource missing **or** not owned by the caller |
| `conflict` | 409 | duplicate email; acting on an already-submitted/archived session |
| `internal` | 500 | unexpected error |

> Cross-seller access returns **404** (not 403) so existence isn't leaked.

---

## Auth

### POST `/api/v1/auth/register`
Create a seller account. A unique `public_slug` is derived from the business name.

**Body**
```json
{ "email": "her@shop.com", "business_name": "Aba Tees", "password": "Password123!" }
```
**201**
```json
{ "data": {
  "seller": { "id","email","business_name","public_slug","brand_logo_key":null,
              "brand_colors":null,"welcome_voice":null,"role":"seller","created_at" },
  "access_token": "…", "refresh_token": "…"
} }
```
**Errors:** `409 conflict` (email taken) · `400 validation_error` (bad email / `business_name` empty / password < 8).

### POST `/api/v1/auth/login`
**Body** `{ "email", "password" }` → **200** same `AuthResponse` shape as register.
**Errors:** `401 unauthorized` (wrong email or password — same message either way).

### POST `/api/v1/auth/refresh`
**Body** `{ "refresh_token" }` → **200** `{ "data": { "access_token", "refresh_token" } }`.
**Errors:** `401 unauthorized` (invalid/expired refresh token; seller deleted).

### POST `/api/v1/auth/logout`
→ **204 No Content** (stateless; client discards tokens).

### GET `/api/v1/me`  🔒
→ **200** `{ "data": { "seller": Seller } }`. **Errors:** `401`.

---

## Sessions (seller, 🔒)

### POST `/api/v1/sessions`
Create a custom per-customer session. Generates an 8-char base62 `token` and a
blank front+back design.

**Body**
```json
{ "customer_name": "Tobi", "shirt_type": "hoodie", "shirt_color": "black",
  "allowed_colors": ["black","white"], "price_quoted": 1500000, "notes": "elegant" }
```
`shirt_type` ∈ `tee|hoodie|polo|oversized`. `price_quoted` is **integer minor
units** (kobo/cents). All except `shirt_type`/`shirt_color` are optional.

**201** `{ "data": { "session": Session } }` → customer link is `/c/{session.token}`.

### GET `/api/v1/sessions?cursor=&status=&limit=`
Cursor-paginated inbox, newest first. `status` ∈ `in_progress|submitted|archived`.
`limit` 1–50 (default 20).

**200**
```json
{ "data": { "items": [ Session, … ] },
  "meta": { "nextCursor": "…|null", "hasMore": true } }
```
Pass `?cursor=<nextCursor>` for the next page. `nextCursor` is `null` on the last page.

### GET `/api/v1/sessions/:id`
**200** `{ "data": { "session": Session, "design": Design } }`.
**Errors:** `404` if missing or owned by another seller.

### PATCH `/api/v1/sessions/:id`
**Body** `{ "status": "archived" }` → **200** `{ "data": { "session": Session } }`.
(Only `archived` is accepted; other bodies are a no-op returning the session.)

### POST `/api/v1/sessions/:id/export`
Render the design to a transparent PNG at a preset or custom size, store it in R2,
return a fresh view URL.

**Body** — either a preset or an explicit size:
```json
{ "preset": "web", "side": "front" }
{ "w": 4500, "h": 5400, "dpi": 300, "side": "back" }
```
Presets: `web` (1024²), `standard` (2400×3200), `shirt-us` (4500×5400@300),
`a4` (2480×3508@300), `a3` (3508×4961@300). `side` ∈ `front|back` (default `front`).

**200** `{ "data": { "key": "…png", "url": "https://…" } }` — `key` is the
permanent R2 key (persisted on the design); `url` is a fresh ~1h view link.
**Errors:** `400 validation_error` (neither preset nor w+h) · `404` (not owned).

---

## Public design surface (customer link — token is the key, no auth)

### GET `/api/v1/c/:token`
Load the customer design context.

**200**
```json
{ "data": {
  "session": { "id","kind","token","customer_name","shirt_type","shirt_color",
               "allowed_colors","status" },
  "design": Design,
  "brand": { "business_name","public_slug","brand_logo_key","brand_colors","welcome_voice" }
} }
```
The public session omits `seller_id`, `notes`, `price_quoted`. **Errors:** `404`.

### PUT `/api/v1/c/:token/design`
Debounced autosave of the canvas.

**Body** `{ "canvas_front": Scene, "canvas_back": Scene }` (see [Scene](#scene-canvas-schema)).
**200** `{ "data": { "design": Design } }`. Touches `last_activity_at`.
**Errors:** `409 conflict` if the session is already submitted/archived · `400` (scene fails Zod).

### POST `/api/v1/c/:token/assets`
Record an image uploaded directly to R2 (the backend never receives bytes).

**Body** `{ "storage_key": "abc.png", "mime": "image/png", "width": 800, "height": 800, "bytes": 12345 }`
(`width`/`height`/`bytes` optional). **201** `{ "data": { "asset": Asset } }`.
**Errors:** `409` (submitted/archived).

> **Upload flow:** the frontend calls the file-service `/get-upload-uri`, `PUT`s
> the file to the returned URL, then POSTs the `storage_key` here. See
> [storage](#storage--r2-file-service).

### POST `/api/v1/c/:token/submit`
Finalise and route the design back to the seller. Fires a best-effort web-push.

**Body** `{ "customer_name": "Wale" }` (optional — captured for public walk-ins).
**200** `{ "data": { "session": Session } }` with `status: "submitted"`.
**Errors:** `409` (already submitted/archived).

---

## Storefront (public "second in")

### GET `/api/v1/s/:slug`
Public storefront for a seller.

**200**
```json
{ "data": {
  "brand": PublicBrand,
  "shirt_types": ["tee","hoodie","polo","oversized"],
  "shirt_colors": ["white","black","sand", …]
} }
```
**Errors:** `404` (unknown slug).

### POST `/api/v1/s/:slug/start`
Cold walk-in: create a `kind:"public"` session and return its token. Drops the
customer into the same `/c/:token` canvas; submissions land in the same inbox.

**Body** `{ "shirt_type": "tee", "shirt_color": "white" }`
**201** `{ "data": { "token": "8charid" } }`.

---

## Notifications (seller, 🔒)

### POST `/api/v1/notifications/subscribe`
Register a Web Push subscription. On a design submit, the seller's subscriptions
receive a "New design submitted" push (best-effort; dead subscriptions are pruned).

**Body** `{ "endpoint": "https://…", "keys": { "p256dh": "…", "auth": "…" } }`
→ **204**. Requires `VAPID_*` env to actually deliver (no-op without).

---

## Health

### GET `/api/v1/health`
→ **200** `{ "data": { "status":"ok", "service":"main-backend", "env", "time" } }`.

---

## Scene (canvas schema)

The design JSON, shared by the editor, autosave, and the exporter. Coordinates are
**normalized 0..1** of the print area.

```ts
Scene = {
  version: 1,
  shirt: { type: 'tee'|'hoodie'|'polo'|'oversized', color: string },
  layers: Layer[]          // z-order = array order (last = top)
}

TextLayer  = { id, kind:'text', x, y, scale, rotation, opacity,
               text, font, color, stroke?: { color, width }, shadow? }
ImageLayer = { id, kind:'image', x, y, scale, rotation, opacity,
               assetKey, source: 'upload'|'ai' }   // 'ai' reserved (post-MVP)
```
`font` is one of the 12 curated ids (`archivo-black`, `space-grotesk`, …). The
exporter renders the same scene server-side via `@napi-rs/canvas`.

---

## Domain shapes

```ts
Seller  = { id, email, business_name, public_slug, brand_logo_key|null,
            brand_colors|null, welcome_voice|null, role:'seller'|'admin', created_at }
Session = { id, seller_id, kind:'custom'|'public', token, customer_name|null,
            shirt_type, shirt_color, allowed_colors|null, price_quoted|null,
            notes|null, status:'in_progress'|'submitted'|'archived',
            created_at, last_activity_at }
Design  = { id, session_id, canvas_front: Scene, canvas_back: Scene,
            submitted_at|null, export_keys: { [presetSide]: key }|{}, updated_at }
Asset   = { id, seller_id|null, session_id|null, kind:'upload'|'export'|'logo'|'ai',
            storage_key, mime, width|null, height|null, bytes|null, created_at }
```
All `*_at` are ISO-8601 strings. `price_quoted` is integer minor units.

---

## Storage — R2 file-service

Images are stored via the external presigned-URL proxy
(`go-file-service-production.up.railway.app`). **No file bytes pass through the
Shirtify backend, and only the `key` is persisted** (never the expiring URL).

- **Upload (browser):** `GET /get-upload-uri?ext=png` → `{ key, uri }`; `PUT` file
  to `uri`; POST `key` to `/c/:token/assets`.
- **View:** `GET /get-file-uri?key=…` → `{ uri }` (~1h). Fetch fresh; never cache > 1h.
- **Export (server):** the backend renders the PNG, uploads it the same way, and
  stores the resulting key on `design.export_keys`.

---

## Post-MVP seam (not implemented)

AI generation/edit is reserved, not built: `ImageLayer.source` and `Asset.kind`
already allow `'ai'`; the future `/c/:token/ai/*` routes bolt onto this surface
with no change to the design model. See `docs/product/shirtify-build-plan.md` §9.
