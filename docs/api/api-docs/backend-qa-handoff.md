# Backend QA Handoff — Phase 1 (entire MVP API)

**Date:** 2026-06-12
**Build:** Typecheck ✅ · Lint ✅ · Tests ✅ (19/19) · Build ✅
**Base URL:** `http://localhost:8081/api/v1`
**Auth header:** `Authorization: Bearer <access_token>`

The full MVP API is implemented behind Repository ports (MongoDB/Mongoose), with
Zod validation end-to-end and contract tests at every seam. Frontend phases build
against this without stubbing.

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
| POST | `/auth/register` | — | 201; unique slug; 409 on dup email |
| POST | `/auth/login` | — | 200; 401 on bad creds |
| POST | `/auth/refresh` | — | 200; 401 on bad token |
| POST | `/auth/logout` | — | 204 |
| GET | `/me` | ✅ | current seller |
| POST | `/sessions` | ✅ | creates token + blank design |
| GET | `/sessions` | ✅ | cursor list (`?cursor=&status=&limit=`) |
| GET | `/sessions/:id` | ✅ | session + design; 404 if not owned |
| PATCH | `/sessions/:id` | ✅ | archive |
| POST | `/sessions/:id/export` | ✅ | render → R2 → `{ key, url }` |
| GET | `/c/:token` | token | public session + design + brand |
| PUT | `/c/:token/design` | token | autosave; 409 if submitted |
| POST | `/c/:token/assets` | token | record R2 key |
| POST | `/c/:token/submit` | token | → submitted; fires push |
| GET | `/s/:slug` | — | storefront brand + options |
| POST | `/s/:slug/start` | — | public walk-in → token |
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
