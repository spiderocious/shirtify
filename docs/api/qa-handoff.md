# QA Handoff — Shirtify main-backend

**Date:** 2026-06-12
**Base URL:** `http://localhost:9091/api/v1`
**Stack:** Express + MongoDB (Mongoose), JWT auth (access/refresh), AsyncLocalStorage request context
**Tester:** Backend QA (code-flow audit + live curl/mongosh execution)

---

## Environment Setup

| Variable | Value |
|----------|-------|
| `PORT` | 9091 |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/shirtify` |
| `JWT_ACCESS_EXPIRES_IN` | 15m |
| `JWT_REFRESH_EXPIRES_IN` | 30d |
| `FILE_SERVICE_URL` | external R2 proxy (live; export round-trips ~4s) |

**Test account bootstrap:** `pnpm seed` → seller `her@shirtify.app` / `changeme123`, storefront slug `shirtify`.
**Run:** `pnpm dev`. **Unit suite:** `pnpm test` → **19/19 passing**.

**Valid enum values (from `@shirtify/core`):**
- `shirt_type`: `tee | hoodie | polo | oversized`
- `shirt_color` ids: `white black sand navy forest maroon grey lime`
- export `preset`: `web standard shirt-us a4 a3`

---

## Route Surface

| Mount | Method + Path | Auth | Notes |
|-------|---------------|:----:|-------|
| health | GET `/health` | ❌ | liveness |
| auth | POST `/auth/register` `/auth/login` `/auth/refresh` `/auth/logout` | ❌ | logout is a 204 no-op (stateless) |
| me | GET `/me` | ✅ | seller profile |
| sessions | POST/GET `/sessions`, GET/PATCH `/sessions/:id`, POST `/sessions/:id/export` | ✅ | router-level `requireAuth` |
| notifications | POST `/notifications/subscribe` | ✅ | web-push upsert |
| storefront | GET `/s/:slug`, POST `/s/:slug/start` | ❌ | public walk-in |
| public | GET `/c/:token`, PUT `/c/:token/design`, POST `/c/:token/assets`, POST `/c/:token/submit` | ❌ (token-scoped) | customer surface |

---

## Bugs Found

| ID | Severity | Title |
|----|:--------:|-------|
| BUG-01 | **P1** | `shirt_color` is an unvalidated free string — out-of-catalog colors persist |
| BUG-02 | **P2** | Malformed JSON body returns **500 `internal`** instead of 400 |
| BUG-03 | P3 | No rate limiting on `/auth/login` (unbounded credential stuffing) |
| BUG-04 | P3 | `Idempotency-Key` header is ignored on POST `/sessions` — silent duplicates |
| OBS-01 | info | Export is synchronous and ~4.3s (external R2 + render) — no timeout/async path |

### BUG-01 — `shirt_color` accepts any string (P1)
`StartSessionBody` / `CreateSessionBody` type `shirt_color` as a plain `z.string()`, not an enum over `SHIRT_COLORS`. Invalid colors are accepted and written to the DB.

```bash
curl -s -X POST $BASE/sessions -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"shirt_type":"tee","shirt_color":"chartreuse"}'
# actual:   201, session.shirt_color = "chartreuse"  ← persisted
# expected: 400, field_errors.shirt_color  (or coerced to catalog)
```
Same gap on `POST /s/:slug/start` and inside the `SceneSchema.shirt.color`. Downstream the renderer/storefront UI will have no swatch for the color. **Fix:** make `shirt_color` a `z.enum(SHIRT_COLORS.map(c=>c.id))` in `packages/core/src/schemas/api.ts`.

### BUG-02 — malformed JSON → 500 (P2)
```bash
curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' -d '{bad json'
# actual:   500 { error:{ code:"internal", message:"An unexpected error occurred" } }
# expected: 400 { error:{ code:"validation_error" | "bad_json" } }
```
`express.json()` throws a `SyntaxError` (with `.type === 'entity.parse.failed'`) that is neither `AppError` nor `ZodError`, so `errorHandler.middleware.ts` falls through to the generic 500 branch. A client input error is being reported as a server fault. **Fix:** in the error handler, map `err instanceof SyntaxError && 'body' in err` (or `err.type === 'entity.parse.failed'` / `'entity.too.large'`) to 400.

### BUG-03 — no auth rate limiting (P3)
25 rapid wrong-password logins → all `401`, no `429`, no `Retry-After`. No limiter middleware is registered in `app.ts`. Acceptable for MVP but should be tracked before public launch.

### BUG-04 — Idempotency-Key ignored (P3)
Two `POST /sessions` with the **same** `Idempotency-Key` and body created **2** rows (verified via `mongosh countDocuments`). No idempotency layer exists. If the seller UI ever retries on network failure, duplicate sessions/tokens result. Acceptable only if the client guarantees no retries.

---

## Test Matrix — Auth

| # | Test | Method + Path | Expected | Result |
|---|------|---------------|----------|:------:|
| A1 | Valid login | POST `/auth/login` | 200, `{access_token, refresh_token, seller}` | ✅ |
| A2 | Seller payload has no `password_hash` | login / `/me` | secret excluded | ✅ |
| A3 | Wrong password (valid length) | POST `/auth/login` | 401 `unauthorized`, "Invalid email or password" | ✅ |
| A4 | Unknown email | POST `/auth/login` | **identical** 401 + message (no enumeration) | ✅ |
| A5 | Empty body | POST `/auth/login` | 400, `field_errors.email/password` | ✅ |
| A6 | `/me` no token | GET `/me` | 401 `unauthorized`, "Missing bearer token" | ✅ |
| A7 | `/me` garbage token | GET `/me` | 401, "Invalid or expired token" | ✅ |
| A8 | Refresh rotation | POST `/auth/refresh` | 200, new tokens | ✅ |
| A9 | **Refresh reuse** (replay old RT) | POST `/auth/refresh` | *currently* 200 — **stateless, no revocation** | ⚠️ by-design |
| A10 | Access token used as refresh | POST `/auth/refresh` | 401 (type guard) | ✅ |
| A11 | Register duplicate email | POST `/auth/register` | 409 `conflict` | ✅ |

> A9: refresh tokens are stateless JWTs with no server-side store, so an old refresh token keeps working until natural expiry (30d). Not a regression — note it so the team decides if rotation+revocation is needed pre-launch.

---

## Test Matrix — Customer Flow (`/c/:token`)

| # | Test | Expected | Result |
|---|------|----------|:------:|
| P1 | GET context (session+design+brand) | 200; **no `seller_id`/internal leak** in `session`/`brand` | ✅ |
| P2 | Autosave valid scene (PUT design) | 200, design saved | ✅ |
| P3 | Autosave malformed scene | 400, `field_errors` on `canvas_front.*` | ✅ |
| P4 | Opacity out of range (`>1`) | 400 | ✅ |
| P5 | Register asset | 201 | ✅ |
| P6 | Submit | 200, status → `submitted` | ✅ |
| P7 | **Autosave after submit** | 409 `conflict` | ✅ |
| P8 | **Register asset after submit** | 409 `conflict` | ✅ |
| P9 | **Double submit** | 409 `conflict` | ✅ |
| P10 | Unknown token | 404 `not_found` | ✅ |
| P11 | customer_name overwrite at submit | name set at submit only if previously empty | ✅ by-design |

---

## RBAC / Ownership Isolation

Second seller `mallory@evil.app` against seller1's session id:

| # | Endpoint | Cross-seller (mallory) | Owner | Result |
|---|----------|:----------------------:|:-----:|:------:|
| O1 | GET `/sessions/:id` | 404 | 200 | ✅ |
| O2 | PATCH `/sessions/:id` (archive) | 404 | 200 | ✅ |
| O3 | POST `/sessions/:id/export` (valid body) | 404 | 200 | ✅ |
| O4 | GET `/sessions` (list) | seller1 rows **not** visible (count 0) | — | ✅ |

Ownership is enforced in the service layer (`session.seller_id !== sellerId → NotFoundError`), returning 404 (not 403) so existence isn't leaked. Correct.

---

## State Machine

| # | Transition | Expected | Result |
|---|-----------|----------|:------:|
| SM1 | `in_progress` → save/asset | 200/201 | ✅ |
| SM2 | `in_progress` → `submitted` | 200 | ✅ |
| SM3 | `submitted` → save/asset/submit | 409 `conflict` | ✅ |
| SM4 | `archived` → customer edit | 409 "link no longer active" | ✅ (code-verified) |

> Note: Zod body validation runs **before** the editable-state check, so an invalid body on a submitted session returns 400, not 409. Acceptable (both are client errors) but worth knowing when reading logs.

---

## Edge Cases / Cross-Cutting

| # | Check | Result |
|---|-------|:------:|
| EC1 | Pagination `limit=0` / `999` / `abc` | 400 each | ✅ |
| EC2 | Invalid `status` filter | 400 | ✅ |
| EC3 | Garbage `cursor` | 200, no 500 | ✅ |
| EC4 | Unknown storefront slug | 404 `not_found` | ✅ |
| EC5 | Unknown route | 404 envelope `{error:{code:"not_found"}}` | ✅ |
| EC6 | Form content-type on JSON endpoint | 400 | ✅ |
| EC7 | GET on POST-only `/auth/login` | 404 (no method-aware 405) | acceptable |
| X-01 | `x-request-id` echoed back in response headers | ✅ |
| X-02 | Timestamps ISO-8601 with `Z` | ✅ |
| X-03 | No secret fields (`password_hash`) in any response | ✅ |
| X-04 | Error envelope shape consistent `{error:{code,message,field_errors?}}` | ✅ (except BUG-02) |
| X-05 | **Concurrent identity isolation** — 40 interleaved `/me` calls, 2 sellers, no context bleed | ✅ |

> X-05 specifically validated the `AsyncLocalStorage` request-context design: `requireAuth` mutates the active store via `requestContext.set('userId', …)`. Because each request runs inside its own `storage.run(...)` (`requestId.middleware.ts`), there is **no cross-request bleed** under concurrency. The HTTP-doesn't-leak-into-services pattern holds.

---

## Code-Flow Audit Notes (no violations found)

- Every async route handler is wrapped in `asyncHandler` — no unhandled rejections. ✅
- All responses go through `ResponseUtil` — no raw `res.json` bypass. ✅
- Services throw typed `AppError` subclasses; HTTP never leaks into the service layer (identity read from context, not `req`). ✅
- Protected routers apply `requireAuth` at the router level (`sessions`, `notifications`) or per-route (`me`). ✅
- Money/price fields not exercised here (MVP `price_quoted` is optional metadata, not a ledger). No financial invariants to verify yet.

---

## Recommended Fix Priority

1. **BUG-01** (P1) — validate `shirt_color` against the catalog enum. Data-integrity; cheap fix in `core` schemas.
2. **BUG-02** (P2) — map JSON parse errors to 400 in `errorHandler.middleware.ts`.
3. **BUG-03 / BUG-04** (P3) — rate limiting + idempotency before public launch; safe to defer for internal MVP.
