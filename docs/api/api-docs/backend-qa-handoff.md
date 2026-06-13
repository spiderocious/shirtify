# Backend QA Handoff — Phase 1 (entire MVP API)

**Date:** 2026-06-12
**Build:** Typecheck ✅ · Lint ✅ · Tests ✅ (30/30) · Build ✅
**Base URL:** `http://localhost:9091/api/v1`
**Auth header:** `Authorization: Bearer <access_token>`

The full MVP API is implemented behind Repository ports (MongoDB/Mongoose), with
Zod validation end-to-end and contract tests at every seam. Frontend phases build
against this without stubbing.

## QA round 1 — bugs resolved (regression-tested)

| ID | Sev | Fix | Test |
|---|---|---|---|
| BUG-01 | P1 | `shirt_color` is now validated against the seller's colour catalogue (DB-backed: platform ∪ her own), not a free string. New `colors` collection + `/colors` endpoints; `"chartreuse"` → 400. | `features/colors/colors.test.ts` |
| BUG-02 | P2 | `express.json` `SyntaxError` (`entity.parse.failed` / `entity.too.large`) now mapped to **400/422**, not 500. | `features/auth/hardening.test.ts` |
| BUG-03 | P3 | `/auth/login` (10/15min) + `/auth/register` (20/h) rate-limited per IP → **429** + `Retry-After`. | `features/auth/hardening.test.ts` |
| BUG-04 | P3 | `POST /sessions` honours `Idempotency-Key` (per seller, 24h TTL) — retries return the original session, no duplicate. | `features/auth/hardening.test.ts` |

> A9 (refresh-token replay, by-design) and OBS-01 (synchronous export) were left
> as noted — not regressions. Revisit refresh rotation + async export pre-launch.

---

## Running it

```bash
# Dev (needs a local MongoDB at MONGODB_URI, default mongodb://127.0.0.1:27017/shirtify)
pnpm --filter @shirtify/main-backend dev

# Seed seller #1 (idempotent)
pnpm --filter @shirtify/main-backend seed

# Tests (no external services — in-memory Mongo + mocked file-service)
pnpm --filter @shirtify/main-backend test
```

Env: copy `.env.example` → `.env`. Required: `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET` (≥32 chars). `VAPID_*` optional (push is a no-op without).
`FILE_SERVICE_URL` defaults to the production R2 proxy.

---

## Seed seller

| Field | Default (env-overridable) |
|---|---|
| email | `her@shirtify.app` (`SEED_SELLER_EMAIL`) |
| password | `changeme123` (`SEED_SELLER_PASSWORD`) |
| business | `Shirtify` (`SEED_SELLER_BUSINESS`) |

Self-serve signup is open (`POST /auth/register`), so QA can mint sellers freely.

---

## Endpoints implemented

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | — | 201; unique slug; 409 dup email; **rate-limited 20/h** |
| POST | `/auth/login` | — | 200; 401 bad creds; **rate-limited 10/15min → 429** |
| POST | `/auth/refresh` | — | 200; 401 on bad token |
| POST | `/auth/logout` | — | 204 |
| GET | `/me` | ✅ | current seller |
| POST | `/sessions` | ✅ | creates token + blank design; **honours `Idempotency-Key`**; validates `shirt_color` |
| GET | `/sessions` | ✅ | cursor list (`?cursor=&status=&limit=`) |
| GET | `/sessions/:id` | ✅ | session + design; 404 if not owned |
| PATCH | `/sessions/:id` | ✅ | archive |
| POST | `/sessions/:id/export` | ✅ | render → R2 → `{ key, url }` |
| GET | `/colors` | ✅ | platform + her own colours |
| POST | `/colors` | ✅ | add her own colour; 409 dup slug |
| DELETE | `/colors/:id` | ✅ | remove her own; 404 on platform |
| GET | `/c/:token` | token | public session + design + brand |
| PUT | `/c/:token/design` | token | autosave; 409 if submitted |
| POST | `/c/:token/assets` | token | record R2 key |
| POST | `/c/:token/submit` | token | → submitted; fires push |
| GET | `/s/:slug` | — | storefront brand + per-seller colours |
| POST | `/s/:slug/start` | — | public walk-in → token; validates `shirt_color` |
| POST | `/notifications/subscribe` | ✅ | web-push subscription |
| GET | `/health` | — | liveness |

---

## RBAC / access matrix

| Action | seller (owner) | seller (other) | anon + token | anon |
|---|---|---|---|---|
| Session CRUD | ✅ | ❌ 404 | ❌ 401 | ❌ 401 |
| Export | ✅ | ❌ 404 | ❌ 401 | ❌ 401 |
| `GET /c/:token` | — | — | ✅ | ✅ (token is the key) |
| Autosave/submit | — | — | ✅ | ✅ |
| Storefront | — | — | — | ✅ |

A seller accessing another seller's session gets **404** (existence not leaked).

---

## State machine — session.status

| State | → transition | Trigger |
|---|---|---|
| `in_progress` | → `submitted` | `POST /c/:token/submit` |
| `in_progress` | → `archived` | `PATCH /sessions/:id` |
| `submitted` | (terminal for customer) | autosave/submit return **409** |
| `archived` | (terminal for customer) | customer routes return **409** |

---

## Critical edge cases (all covered by tests)

| Scenario | Expected |
|---|---|
| Duplicate email | `409 conflict` |
| Wrong password / unknown email | `401 unauthorized` (same message) |
| Invalid register body | `400 validation_error` + `field_errors` |
| Another seller's session | `404 not_found` |
| Unknown token | `404 not_found` |
| Autosave/submit after submit | `409 conflict` |
| Export with neither preset nor w+h | `400 validation_error` |
| Pagination | `meta.nextCursor` (string\|null) + `meta.hasMore` both sides |
| Public walk-in → inbox | `kind:'public'` session appears in seller's list |

---

## Money fields

| Field | Unit | Notes |
|---|---|---|
| `price_quoted` | integer minor units (kobo/cents) | nullable; never float |

---

## Pagination

- **Type:** cursor-based (Mongo `_id`, newest-first).
- **Cursor:** `meta.nextCursor`; **has more:** `meta.hasMore`.
- First page: no `cursor` param. Next: `?cursor=<nextCursor>`. Last page → `nextCursor: null`.

---

## External services (stubbed in tests)

| Service | Test strategy |
|---|---|
| MongoDB | `mongodb-memory-server`, truncated between tests |
| R2 file-service | `global.fetch` mocked for `/get-upload-uri`, `/get-file-uri`, PUT |
| Web Push | no-op unless `VAPID_*` set; never blocks submit |

---

## Out of scope (later phases)

- [ ] All frontend (Phases 2–7).
- [ ] AI generation/edit (post-MVP; seam reserved).
- [ ] Brand-settings write endpoints + logo generation (Phase 7).
- [ ] Real font-file registration in the exporter (currently system-font fallback).
- [ ] `wa.me` reminder is a helper (`buildWhatsAppReminder`); no endpoint yet (Phase 7 UI).
