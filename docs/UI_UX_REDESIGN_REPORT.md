# UI/UX Redesign Report — ToonExpo Ecosystem

**Date:** 2026-07-21  
**Scope:** Full frontend design-system evolution across public, buyer, builder, partner, and admin surfaces.  
**Constraint:** Preserve NestJS API, Prisma schema (except safe seed media URLs), auth/RBAC, i18n, and business logic.

---

## Audited areas

- `README.md`, `docs/MODULE_STATUS.md`, `docs/02-ToonExpo-Ecosystem/03-UI-UX/*`
- `apps/web/src/app/[locale]` — 62 `page.tsx` routes
- `apps/web/src/features/*` — catalog, auth, buyer, builder, admin, partner, mortgage, exhibition, visual-map, analytics
- `apps/web/src/shared/ui` — previously thin primitives only
- Message catalogs `en` / `ru` / `hy`
- Design tokens in `globals.css` (Variant A baseline)
- Seed demo data in `packages/db/prisma`
- Playwright / Vitest presence

## Discovered inconsistencies

| Finding                                                                       | Impact                                       |
| ----------------------------------------------------------------------------- | -------------------------------------------- |
| Shared UI limited to Button/Card/Input/Textarea/Header                        | Repeated Tailwind strings; uneven density    |
| Unicode menu icons (`☰` / `✕`)                                               | Non-professional iconography                 |
| Inter / Outfit / Syne lacked Armenian glyphs                                  | Default locale `hy` fell back inconsistently |
| Homepage missing explore / exhibition / mortgage / partners / final CTA bands | Incomplete marketing story                   |
| Portal shells duplicated without mobile drawer                                | Weak mobile portal UX                        |
| No motion system                                                              | Ad-hoc or absent reveal patterns             |
| Seed covers used generic `placehold.co` text tiles                            | Weak catalog visuals                         |
| Loading / empty / error states inconsistent                                   | Uneven trust and polish                      |

## Design direction

Evolve Variant A into a **premium Armenian PropTech + exhibition** system:

- Warm ivory surfaces (`#fafaf8` / `#f3f2ef`) with elevated white cards
- Deep charcoal ink (`#12131a`)
- Refined teal brand (`#1f9aa3`) + secondary `#2a667b`
- Restrained status colors (success / warning / danger / info)
- No gold cliché, no neon, no decorative blur without purpose
- Luxury via typography, spacing, photography, hierarchy, and subtle motion

## Design tokens

Expanded in `apps/web/src/app/[locale]/globals.css` (`@theme`):

- Colors: brand, brand-hover, brand-soft, surfaces, ink scale, borders, status, chart, map
- Radii: xs → xl + pill
- Shadows: xs / sm / md / lg / card / sheet
- Layout: content / narrow / wide, page gutter, section spacing
- Motion: premium easings, fast/base/slow durations
- Z-index scale: sticky → toast
- Utilities: `.page-container`, `.section-pad`, `.text-page-title`, `.text-section-title`, `.text-eyebrow`, `.touch-target`, `.cta-band-glow`

## Typography decisions

| Role            | Face                                       | Notes                                    |
| --------------- | ------------------------------------------ | ---------------------------------------- |
| UI / body       | **Noto Sans** (latin, latin-ext, cyrillic) | Shared weight for EN/RU                  |
| Armenian glyphs | **Noto Sans Armenian**                     | Same stack; optical continuity for `hy`  |
| Brand / display | **Outfit** with Noto fallbacks             | Latin wordmark; hy falls through cleanly |

Removed Syne (no Armenian / Cyrillic coverage). Responsive clamp scale for hero / page / section titles.

## Shared components created / changed

**Created**

- `brand-logo`, `badge`, `icon-button`, `skeleton`, `empty-state`, `error-state`
- `page-header`, `section-header`, `side-sheet`, `dialog`, `portal-shell`
- Motion: `Reveal`, `StaggerGroup`, `AnimatedCounter`

**Changed**

- `button` — variants `primary|secondary|soft|ghost|outline|danger`, sizes including `icon`
- `card` — `muted|elevated|outline|inverse` + padding scale
- `input` / `textarea` — 16px mobile text (no iOS zoom), elevated surface
- `site-header` — Lucide menu, active nav, scroll-lock drawer, BrandLogo

**Dependency added:** `lucide-react@0.525.0` (single icon library).

## Animation architecture

- CSS + Intersection Observer only (no Framer Motion)
- GPU-friendly `opacity` + `translate3d`
- Reduced travel on mobile; full respect for `prefers-reduced-motion`
- Stagger capped (12 items) to avoid long delays
- Client wrappers kept small so Server Components stay default

## Pages redesigned / upgraded

| Area     | Work                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| Homepage | Full section set: hero, stats+counters, featured, explore, builders, exhibition, mortgage, partners, final CTA, footer |
| Catalog  | Projects / builders / partners layout tokens, project & builder cards                                                  |
| Auth     | Login / register / forgot-password elevated cards                                                                      |
| Buyer    | Profile shell, icon tabs, QR presentation                                                                              |
| Portals  | Shared `PortalShell` + icon sidebars (builder/admin/partner) + mobile drawer                                           |
| CRM      | Page title, loading skeletons, empty treatment, table chrome                                                           |
| Demo     | Local `/public/demo/*.svg` wired into seed media URLs                                                                  |

## Responsive improvements

- Mobile-first portal drawer (replaces stacked sidebar-only nav)
- Public header mobile menu with overflow lock + route close
- `page-container` / `section-pad` consistency
- Tables remain horizontally scrollable on desktop; card list on mobile (CRM)
- Touch-friendly icon buttons (≥36–40px)
- Hero search stacks on small screens

## Accessibility improvements

- Lucide icons with `aria-hidden` + labeled `IconButton`
- Dialog / side-sheet: Escape, focus target, body scroll lock, `aria-modal`
- Visible `:focus-visible` brand ring
- Empty / error roles (`role="alert"` where appropriate)
- Reduced-motion global CSS kill-switch

## Performance considerations

- Motion clients isolated; homepage data still fetched in RSC
- `next/image` retained; SVG demo assets allowed via `dangerouslyAllowSVG` (dev placeholders)
- No new heavy animation library
- Stagger/reveal disconnect after first paint

## Demo-data changes

- `packages/db/prisma/seed-data.ts` — `demoCoverUrl` / `demoLogoUrl` → `/demo/*.svg`
- `seed-catalog.ts` uses local demo URLs for seed media
- Assets in `apps/web/public/demo/` (architecture silhouettes + logos)
- Still idempotent `seed_*` IDs; production seed path unchanged

## Dependencies added

| Package        | Why                                  |
| -------------- | ------------------------------------ |
| `lucide-react` | Consistent professional stroke icons |

## Remaining limitations

- Not every dense admin/builder form was visually rewritten line-by-line; all share the new tokens/shell/primitives
- Exhibition map Konva migration remains a product backlog item (`MODULE_STATUS`)
- Some detail pages still use older local class patterns; they inherit global tokens
- Playwright e2e not run in this session (requires full env + seed confirmation)
- Re-seed required locally to refresh media URLs to `/demo/*`

## Commands executed

```bash
pnpm --filter @toonexpo/web add lucide-react@0.525.0
pnpm --filter @toonexpo/web typecheck
pnpm --filter @toonexpo/web lint
pnpm --filter @toonexpo/web test
pnpm --filter @toonexpo/web build
```

Manual: browser check of `/en` homepage (hero + sections present).

## Final quality results

| Gate             | Result                            |
| ---------------- | --------------------------------- |
| Lint             | Pass                              |
| Typecheck        | Pass                              |
| Unit tests       | Pass (21 files / 98 tests)        |
| Production build | Pass (126 static paths generated) |
| E2E (`pnpm e2e`) | Not executed this session         |

---

**Version:** 1.0 · **Author:** Cursor Auto agent session
