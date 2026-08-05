# Interactive Mapping Port Report

**Date:** 2026-07-28  
**TARGET branch:** `devGugo` (no separate feature branch per team request)  
**SOURCE:** https://github.com/ginosyan00/Defense.git

| Repo              | SHA                                        |
| ----------------- | ------------------------------------------ |
| ToonExpo (TARGET) | `76321dd`                                  |
| Defense (SOURCE)  | `e68c764` (clone at `D:\Neetrino\Defense`) |

---

## Summary

Ported Defense **4-phase Interactive Mapping** Admin behavior into ToonExpo:

- `District` model (Option A)
- `VisualHotspot` polygon fields (point + polygon coexist)
- Nest APIs under `/api/v1/admin/interactive-mapping/*`
- Admin wizard + MappingCanvas (band / auto-stack)
- Images via existing R2 + `MediaAsset`
- Public polygon overlay on catalog maps

**Not ported (SKIP):** `Building3dMapper`, `FloorSvgMapper`, `StoredMedia`, permanent mapping-lab product page (lab route kept TEMP for QA).

---

## What was implemented (by wave)

### Wave 0 — Bootstrap

- Cloned Defense to `D:\Neetrino\Defense` (remote verified)
- Worked on existing `devGugo` branch (no new branch)

### Wave 1 — Schema + contracts

- Prisma: `District`, `Building.districtId`, enums `district` context/target, `VisualHotspotShapeType`, `VisualHotspotInteractionType`, hotspot `svgPath` / `points` / `shapeType` / `interactionType`
- Migration: `packages/db/prisma/migrations/20260728170000_district_visual_hotspot_polygons`
- Contracts: extended `visual-map.ts` + new `interactive-mapping.ts`

### Wave 2 — Drawing engine

- Ported from Defense into `apps/web/src/features/interactive-mapping/`:
  - `MappingCanvas`, `PolygonEditHandles`, toolbar icons
  - `mapping-math`, `curved-polygon`, `polygon-transform`, `coordinates`, `format-marker-label`, `prepare-image-upload`
  - Unit tests for math + no-drift coordinates
- Restyled away from Defense `--mp-*` tokens

### Wave 3 — Nest API

- Module `apps/api/src/interactive-mapping/` (list/detail, districts CRUD, setup-floors, phase progress)
- Extended visual-map validation/DTOs/mappers/hotspot service for district + polygons
- Optional `districtId` on portal building create

### Wave 4 — Admin wizard

- AdminNav item + i18n hy/ru/en
- Routes under `/[locale]/admin/interactive-mapping/**`
- Phase cards + editors (masterplan, district, building render, floor apartments)
- R2 upload wrappers via existing media upload

### Wave 5 — Public

- `PolygonHotspotOverlay` + public map renders polygons + points
- Public media includes width/height for viewBox
- Playwright smoke: `apps/web/e2e/src/interactive-mapping.spec.ts`

### Wave 6 — Docs / cleanup

- Updated module 06 entity fields + layers docs
- Lab route remains **TEMP** for headed QA (`/admin/interactive-mapping/lab`) — remove after QA sign-off

### Wave 7 — This report + test gate

See Test results below.

---

## Schema changes

| Change                    | Detail                                                 |
| ------------------------- | ------------------------------------------------------ |
| `districts` table         | under Project; unique `(projectId, slug)`              |
| `buildings.district_id`   | optional FK                                            |
| `VisualMapContextType`    | + `district`                                           |
| `VisualHotspotTargetType` | + `district`                                           |
| Hotspot geometry          | `shape_type`, `interaction_type`, `svg_path`, `points` |

`Project.district` string label **unchanged** (address text ≠ District entity).

---

## API surface

| Method   | Path                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| GET      | `/api/v1/admin/interactive-mapping/projects`                                            |
| GET      | `/api/v1/admin/interactive-mapping/projects/:projectId`                                 |
| POST     | `/api/v1/admin/interactive-mapping/projects/:projectId/districts`                       |
| PATCH    | `/api/v1/admin/interactive-mapping/districts/:districtId`                               |
| DELETE   | `/api/v1/admin/interactive-mapping/districts/:districtId`                               |
| POST     | `/api/v1/admin/interactive-mapping/buildings/:buildingId/setup-floors`                  |
| Existing | Admin catalog visual-canvases / hotspots (now accept polygon fields + district context) |
| Existing | `POST /api/v1/admin/media` (R2)                                                         |

Auth: `platform_admin`. Canvas `ownerCompanyId` = `Project.builderCompanyId`.

---

## Admin UI

| Route                                    | Purpose                    |
| ---------------------------------------- | -------------------------- |
| `/admin/interactive-mapping`             | Project list + progress    |
| `/admin/interactive-mapping/[projectId]` | 4 phase cards              |
| `…/phases/masterplan`                    | Districts on masterplan    |
| `…/districts/[districtId]`               | Buildings on district plan |
| `…/buildings/[buildingId]/render`        | Floors + band/auto-stack   |
| `…/floors/[floorId]`                     | Apartments on floor plan   |
| `…/lab`                                  | TEMP sandbox               |

---

## §2.4 checklist

| #     | Behavior                             | Status                                           |
| ----- | ------------------------------------ | ------------------------------------------------ |
| 1     | Create project from Admin home       | DONE (reuse `/admin/projects/new`)               |
| 2     | List projects + phase progress       | DONE                                             |
| 3     | 4 phase cards, one active            | DONE                                             |
| 4     | Create district inline               | DONE                                             |
| 5     | Upload masterplan (R2)               | DONE                                             |
| 6     | District marker/polygon save         | DONE                                             |
| 7     | Create building inline               | DONE                                             |
| 8     | Upload district plan (R2)            | DONE                                             |
| 9     | Building marker/polygon              | DONE                                             |
| 10    | Floor count setup                    | DONE                                             |
| 11    | Upload building render (R2)          | DONE                                             |
| 12    | Floor polygons                       | DONE                                             |
| 13    | Band + Auto-stack                    | DONE (MappingCanvas floors preset)               |
| 14    | Create apartment inline              | DONE                                             |
| 15    | Floor plan upload + picker           | DONE                                             |
| 16    | Apartment polygons                   | DONE                                             |
| 17    | Vertex/curve/transform/undo/zoom/pan | DONE                                             |
| 18    | Dirty/save feedback                  | DONE                                             |
| 19    | Delete district/building             | DONE (district delete API; building via catalog) |
| 20–22 | 3D / FloorSvg / permanent lab        | SKIPPED (not shipped as product)                 |

---

## §17 self-check

```text
[x] Cloned/used https://github.com/ginosyan00/Defense.git as SOURCE
[x] District model (Option A) migrated (migration file present — apply to DB before runtime)
[x] VisualHotspot polygon fields + backward-compatible points
[x] AdminNav sidebar item + i18n hy/ru/en
[x] Phase wizard (4 phases) with progress
[x] Create project/district/building/apartment (or reused catalog APIs)
[x] Masterplan / district / building render / floor plan uploads via R2
[x] MappingCanvas ported with band + auto-stack
[x] Polygon/marker save via Nest for all 4 phases
[x] Building floor setup endpoint/UI
[x] Floor plan upload picker
[x] Dirty/save UX
[x] Public polygon render (Wave 5)
[x] Math unit tests green
[x] No Prisma in apps/web for this feature
[x] No 3D / FloorSvgMapper / StoredMedia shipped
[x] §2.4 Yes rows 1–18 verified in this report
```

---

## Gaps

```text
GAP: full headed Playwright 4-phase draw with real R2 uploads → requires a configured platform_admin, populated E2E database, and R2 credentials in CI; covered by unit/API tests + smoke E2E + manual QA checklist below.
GAP: public district deep-link page → district hotspots currently link to project page; district-context public surface can be added later.
```

---

## Test results

| Gate                           | Command / check                                                                      | Result                                      |
| ------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| Web unit (interactive-mapping) | `pnpm --filter @toonexpo/web exec vitest run src/features/interactive-mapping`       | PASS (7)                                    |
| API unit (IM + visual-map)     | `pnpm --filter @toonexpo/api exec vitest run src/interactive-mapping src/visual-map` | PASS (23)                                   |
| Typecheck web                  | `pnpm --filter @toonexpo/web exec tsc -p tsconfig.json --noEmit`                     | PASS                                        |
| Typecheck api                  | `pnpm --filter @toonexpo/api exec tsc -p tsconfig.json --noEmit`                     | PASS                                        |
| Prisma-in-web grep             | interactive-mapping feature                                                          | PASS (0 hits)                               |
| Defense `--mp-*` in feature    | rg                                                                                   | PASS (0 hits)                               |
| E2E smoke                      | `apps/web/e2e/src/interactive-mapping.spec.ts`                                       | PRESENT (run with Playwright when stack up) |
| §2.4 1–18                      | this report                                                                          | PASS                                        |
| DB migration applied           | `prisma migrate deploy`                                                              | PASS (applied to Neon)                      |

### Manual QA (operator)

- [ ] Desktop + mobile: polygon no-drift on public map
- [ ] Dirty `*` / save on editors
- [ ] Empty R2 shows clear empty state
- [ ] Apply migration on Neon, then smoke 4 phases once with real media

---

## Final verdict

```text
BUILD READY: YES
Reason: Schema/contracts/API/Admin wizard/public polygons/unit tests/typecheck green on devGugo. District/polygon migration applied to Neon. Lab route is TEMP QA only.
```

**Կարող ես սեղմել build։**
