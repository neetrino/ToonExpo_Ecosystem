# Code files over 350 lines

**Date:** 2026-07-29 (updated after split refactor)  
**Threshold:** > 350 lines (raw line count)  
**Scope:** project source code only (`git ls-files` + new split files)

## Method

- Scanned tracked + new source files with extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.css`, `.scss`, `.prisma`, `.sql`
- Excluded: `node_modules`, `.next`, `dist`, `build`, `coverage`, docs, i18n JSON, lockfiles, assets

## Summary

| Metric                | Value |
| --------------------- | ----: |
| Files **> 350 lines** | **0** |

Previously **9** files were over 350; all were split into smaller modules without changing public behavior.

## What was split

| Former file                             | Approach                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| `packages/db/prisma/schema.prisma`      | Multi-file Prisma schema under `prisma/models/*` + `schema: 'prisma'` in config |
| `apps/web/src/app/[locale]/globals.css` | Partials: `theme`, `keyframes`, `base`, `utilities-*`                           |
| `mapping-canvas.tsx`                    | types / toolbar / stage / commits / interactions / keyboard / hints             |
| `crm.e2e-spec.ts`                       | fixtures + harness + `crm-isolation.e2e-spec.ts`                                |
| `portal.e2e-spec.ts`                    | fixtures + harness + `portal-company.e2e-spec.ts`                               |
| `catalog.e2e-spec.ts`                   | fixtures extraction                                                             |
| `packages/contracts/src/index.ts`       | thin `export *` barrel + `health.ts`                                            |
| `multi-listbox-select.tsx`              | types / selection-mark / menu                                                   |

## Verification

- `pnpm --filter @toonexpo/contracts typecheck` — pass
- `pnpm --filter @toonexpo/db typecheck` — pass
- `pnpm --filter @toonexpo/web typecheck` — pass
- `pnpm --filter @toonexpo/api typecheck` — pass
- `pnpm exec prisma validate` / `generate` — pass
- CRM / portal / catalog e2e suites — pass (26 tests) after split

## Notes

- Project coding rule target remains **≤ 300 lines** where practical; a few files still sit in the 301–350 band (e.g. `polygon-edit-handles.tsx`, `portal-shell.tsx`) and were outside this pass’s original list.
- i18n message catalogs (`apps/web/messages/{en,hy,ru}.json`) are translation data, not application code, and are not counted here.
- `packages/contracts` public import path `@toonexpo/contracts` is unchanged.
