# Shirtify design system → `@repo/ui` migration

Shipped from the Studio project **`shirtify`** (stance #28 Neobrutalist pop) into this
monorepo's shared UI package on **2026-06-12**.

- **Visual spec (source of truth):** `…/dockito/design-system/projects/shirtify/` — the HTML
  specimens under `preview/` and `preview/_foundation.css`. Never edited; they remain the
  canonical reference. Each component's JSDoc points back to its specimen.
- **Library:** `packages/ui` (`@repo/ui`)
- **Live viewer:** `apps/web` → route **`/preview`** (`ROUTES.PREVIEW`)

---

## What this ship did first: a RE-THEME

The repo arrived as a fresh monorepo scaffold themed **navy `#1e3a8a` + Inter/Georgia-serif**.
That is not Shirtify. The first job was to re-theme the token layer to neobrutalist-pop
(bone paper, fat ink outlines, four loud flats, Archivo Black / Space Grotesk / JetBrains Mono):

- `packages/ui/src/theme/index.ts` — COLORS + FONTS + GEOMETRY rewritten.
- `packages/ui/src/styles.css` — CSS-var token source of truth + `.shirtify-halftone`,
  `.shirtify-rng` (slider thumb), `.shirtify-skeleton` (sweep). Imported by apps via
  `@repo/ui/styles.css`.
- `apps/{web,admin-web,website}/tailwind.config.ts` — **extended** (never overwritten) to read
  the CSS vars as named colours (`lime`, `ink`, `paper`, …), fonts (`font-display`/`heavy`/
  `sans`/`mono`), `border-3`/`border-2.5`, and `shadow-pop*` (the collapse-shadow).
- Scaffold screens that used removed token names / AppText variants were updated:
  `apps/web` home + example, `apps/admin-web` admin-home, `apps/website` page.

---

## Components generated (20)

All under `packages/ui/src`, `App`-prefixed, `forwardRef` where a DOM ref is useful, named
exports, `cn` from `../../utils/cn.ts`. Every one is registered in the `/preview` viewer.

### Primitives (`primitives/`)
| Component | From specimen |
|---|---|
| `AppButton` (5 variants · 3 sizes · icon-only · collapse-press) | 10-buttons.html |
| `AppText` (display-1/2/3 · heading · body · body-sm · mono · overline) | 02-type.html |
| `AppField` + `AppInput` + `AppTextarea` (label/error/hint, mono) | 11-inputs.html |
| `AppSelect` | 11-inputs.html |
| `AppToggle` (controlled hard switch) | 12-controls.html |
| `AppSlider` (chunky outlined range) | 12-controls.html |
| `AppFontPicker` + `AppColourSwatches` (curated, controlled) | 12-controls.html |
| `AppToolBar` (four-tool + Done signature) | 13-toolbar.html |

### Display (`display/`)
| Component | From specimen |
|---|---|
| `AppPill` (go · ai · warn · ink + dot) | 23-pills.html |
| `AppChip` | 23-pills.html |
| `AppAvatar` (initials, role-tint, 3 sizes) | 23-pills.html |
| `AppBox` + `AppCard` (fat-outline + collapse-shadow, header strip) | 24-cards.html |
| `AppStat` (big Archivo Black number) | 24-cards.html |
| `AppLayerRow` (type-tinted thumb, grip, eye) | 20-layers.html |
| `AppTable<T>` (generic columns, ink header, hover-lime row) | 21-sessions.html |
| `AppAiResultCard` (3-option, blue picked-shadow, `preview` slot, loading) | 22-ai-cards.html |
| `AppEmptyState` + `AppSkeleton` | 25-empty-loading.html |

### Overlays — the DrawerService layer (`drawer/`, translation-guide §0.3)
Imperative singleton + framework-free pub-sub store + three hosts (`useSyncExternalStore` +
`createPortal`), modelled on the gbedity reference. Seven files:
`drawer-store.ts` · `drawer-service.ts` · `toast-host.tsx` (6 zones) · `banner-host.tsx`
(top/bottom) · `modal-host.tsx` (standard / danger / **critical type-DELETE** / custom) ·
`swipeable-toast.tsx` · `index.ts`. Hosts mounted once in `apps/web/src/app.tsx`. Full demo at
`/preview` → DrawerService. The **critical** modal is the irreversible idiom from 40-modals.html
(crimson, type the word DELETE to arm).

---

## Skipped — scenes, not library components

These Studio specimens are full page layouts (visual specs for application code, not building
blocks). Build them in `apps/web` feature screens using the components above:

| Scene | Specimen | Built from |
|---|---|---|
| Customer welcome | 30-welcome.html | AppButton, AppToolBar, AppBox |
| Design canvas (the editor) | 31-canvas.html | AppToolBar, AppLayerRow, AppField, AppSlider, pickers |
| AI moment | 32-ai.html | AppAiResultCard, AppField, AppButton |
| Submit confirmation | 33-submit.html | AppCard, AppPill, AppButton |
| Her dashboard | 34-dashboard.html | AppTable, AppStat, AppAvatar, AppPill, AppButton |
| Session detail | 35-session.html | AppCard, AppPill, AppButton, AppBox |
| New session | 36-new-session.html | AppField, AppSelect, AppButton + custom DrawerService modal |

---

## Conventions detected & followed

- **Nx + pnpm monorepo**, React 19, Tailwind 3.4, Vite (web/admin) + Next (website).
- `App`-prefixed components, `forwardRef`, named exports, `readonly` props where applicable.
- `cn = twMerge(clsx(...))` already present at `packages/ui/src/utils/cn.ts`.
- **`.ts/.tsx` extensions on relative imports** (migrated the scaffold's `.js` convention).
  The `ui` build was flipped to `emitDeclarationOnly: true` + `allowImportingTsExtensions: true`
  (apps consume `@repo/ui` as **source** via Vite/tsconfig alias → `src/index.ts`, so runtime
  JS emit is unnecessary; the build only needs `.d.ts`). `apps/website/tsconfig.json` also
  needed `allowImportingTsExtensions: true` since it imports the package source.
- Lint: `eqeqeq: always` (no `!= null`), `no-explicit-any`, `consistent-type-imports`,
  `no-console` (warn/error only). All satisfied.
- `meemaw` (`Repeat`/`Show`) used in the viewer parts (added to `@repo/web`).
- Fonts: `@fontsource/{archivo-black,archivo,space-grotesk,jetbrains-mono}` self-hosted,
  imported in `apps/web/src/main.tsx`.

## Manual work remaining

- The **website** and **admin-web** apps still carry placeholder scaffold content (now
  re-themed but not real product). Build real screens when ready.
- Build the 7 scenes above as `apps/web` feature screens.
- Wire `@fontsource` imports into `admin-web` / `website` entry points if those apps need the
  Shirtify type stack (currently only `apps/web` imports them).

## Verification

`pnpm typecheck` and `pnpm lint` pass for all 7 projects. `pnpm --filter @repo/ui build`
emits `dist/**/*.d.ts` cleanly.
