# Code files over 350 lines

**Date:** 2026-07-29  
**Threshold:** > 350 lines (raw line count)  
**Scope:** project source code only (`git ls-files`)

## Method

- Scanned **1240** tracked source files with extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.css`, `.scss`, `.prisma`, `.sql`
- Excluded: `node_modules`, `.next`, `dist`, `build`, `coverage`, docs, i18n JSON, lockfiles, assets, generated noise

## Summary

| Metric                | Value |
| --------------------- | ----: |
| Source files scanned  |  1240 |
| Files **> 350 lines** | **9** |

### By area

| Area                 | Count |
| -------------------- | ----: |
| `apps/web`           |     3 |
| `apps/api`           |     3 |
| `packages/db`        |     2 |
| `packages/contracts` |     1 |

## Files (sorted by size, descending)

| Lines | Path                                                                                     |
| ----: | ---------------------------------------------------------------------------------------- |
|  1553 | `packages/db/prisma/schema.prisma`                                                       |
|  1063 | `apps/web/src/app/[locale]/globals.css`                                                  |
|   947 | `apps/web/src/features/interactive-mapping/components/mapping-canvas/mapping-canvas.tsx` |
|   723 | `apps/api/test/crm.e2e-spec.ts`                                                          |
|   469 | `apps/api/test/portal.e2e-spec.ts`                                                       |
|   448 | `apps/api/test/catalog.e2e-spec.ts`                                                      |
|   447 | `packages/db/prisma/seed-catalog.ts`                                                     |
|   391 | `packages/contracts/src/index.ts`                                                        |
|   357 | `apps/web/src/shared/ui/multi-listbox-select.tsx`                                        |

## Notes

- Project coding rule target is **≤ 300 lines per file**; this report uses the requested **350** threshold.
- i18n message catalogs (`apps/web/messages/{en,hy,ru}.json`, ~3300 lines each) were **not** counted — they are translation data, not application code.
- Largest application UI module over the limit: `mapping-canvas.tsx` (947).
- Largest non-UI artifacts: Prisma schema (1553) and `globals.css` (1063).
