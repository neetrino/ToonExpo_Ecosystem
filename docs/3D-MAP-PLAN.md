# 3D Map — Implementation Plan

**Status:** In progress · **Owner:** Orchestrator (Fable 5) · **Created:** 2026-07-31

## Goal

Super-admin managed 3D map of ToonExpo projects. Admin uploads a GLB model per
project, places it on the map (click-to-place, drag-to-move, rotate/scale
controls), and publishes it. Public visitors see project markers at low zoom
and real 3D building models when zooming in. Clicking a model opens the
project card.

Scale target: ~200–300 objects now, up to ~1000 buildings long-term.

## Stack decision

- **MapLibre GL** (OSM vector tiles) — base map, free, no tokens; already used
  in ToonExpo v1.
- **deck.gl `ScenegraphLayer`** (`@deck.gl/mapbox` MapboxOverlay interleaved
  with MapLibre) — renders GLB models at [lng, lat] with orientation + scale.
- **GLB storage:** Cloudflare R2 via existing `apps/api/src/media` module.
- Runtime flow (hard rule): browser → Next.js → NestJS API → Prisma → PostgreSQL.

### Explicit non-goals (rejected complexity from vMap/Cesium prototype)

- No CesiumJS / Cesium ion / terrain / photorealistic tiles.
- No OSM building "replacement" or clipping polygons.
- No LOD pipeline for v1 (viewport-based loading is enough at ≤1000 models).

## Data model (packages/db)

New Prisma model file `packages/db/prisma/models/geo-map.prisma`:

```
model ProjectMapModel {
  id            String   @id @default(cuid())
  projectId     String   @unique              // one 3D model per project (v1)
  mediaAssetId  String                        // GLB file in R2 (MediaAsset)
  longitude     Decimal  @db.Decimal(10, 7)
  latitude      Decimal  @db.Decimal(10, 7)
  altitudeM     Decimal  @default(0)          // meters above ground
  headingDeg    Decimal  @default(0)          // rotation around vertical axis
  pitchDeg      Decimal  @default(0)
  rollDeg       Decimal  @default(0)
  scale         Decimal  @default(1)
  minZoom       Decimal  @default(14)         // zoom at which model replaces marker
  isPublished   Boolean  @default(false)
  createdAt / updatedAt / createdByUserId / updatedByUserId
}
```

Follow existing conventions in `models/*.prisma` (snake_case `@map`,
indexes, relation `onDelete` rules). Relation: `Project 1—0..1 ProjectMapModel`,
`MediaAsset 1—N ProjectMapModel`.

GLB upload: extend media module config with a `model3d` kind — allowed
extension `.glb`, MIME `model/gltf-binary`, max size **15 MB** (named constant).

## API (apps/api/src/geo-map)

New NestJS module `geo-map`, follow conventions of `visual-map` module
(guards, mappers, DTO validation, module registration in `app.module.ts`).

Admin endpoints (super-admin guard, same as other admin controllers):

- `GET    /admin/geo-map/models` — list with project name + media URL
- `POST   /admin/geo-map/models` — create (projectId, mediaAssetId, transform)
- `PATCH  /admin/geo-map/models/:id` — update transform / media / publish flag
- `DELETE /admin/geo-map/models/:id`

Public endpoint (no auth, cacheable):

- `GET /public/geo-map/models` — published only; returns compact payload:
  project id/slug/name, marker data (lng/lat), model URL + transform + minZoom.

Contracts/DTO types go to `packages/contracts` per existing conventions.

## Frontend (apps/web)

Shared map core in `apps/web/src/features/geo-map/`:

- `GeoMapCanvas` — MapLibre init + deck.gl MapboxOverlay + ScenegraphLayer;
  markers below `minZoom`, GLB models above; viewport-based model loading.
- Admin editor page `/[locale]/admin/geo-map`:
  nav item "3D Map" in `apps/web/src/features/admin/admin-nav-items.ts`;
  fullscreen map + side panel: project select, GLB upload, click-to-place,
  drag-to-move, heading/scale sliders, numeric transform fields, publish toggle.
- Public page: markers → 3D on zoom, hover card, click → project page.

MapLibre/deck.gl are client-only (`dynamic(..., { ssr: false })`).

## Stages

| #   | Scope                                                                                        | Model             | Status  |
| --- | -------------------------------------------------------------------------------------------- | ----------------- | ------- |
| 1   | DB schema + migration + `geo-map` API module + media `model3d` kind + contracts + unit tests | Grok 4.5 High     | done    |
| 2a  | `GeoMapCanvas` core: MapLibre + deck.gl integration, marker/model zoom switch                | Sonnet 5 High     | done    |
| 2b  | Admin editor page: panel UI, upload flow, transform controls, wiring to API                  | Grok 4.5 High     | pending |
| 3   | Public map page (reuse `GeoMapCanvas`, read-only)                                            | Composer 2.5 Fast | pending |
| 4   | Map styling (brand colors, OSM building extrusions), polish, i18n strings                    | Composer 2.5 Fast | pending |

Stage rules:

- Each stage ends with a **conventional commit** (no push).
- Each stage verifies only affected packages (typecheck + lint + unit tests);
  full workspace verification is done once by the orchestrator at the end.
- Stage 2a must expose a typed props API so 2b and 3 can consume it without
  touching its internals.

## Acceptance criteria (v1 done)

1. Super admin opens "3D Map", uploads a GLB, places/moves/rotates/scales it,
   publishes — data persisted via API in PostgreSQL, file in R2.
2. Public map shows markers at low zoom and 3D models above `minZoom`;
   click opens the project.
3. No Prisma/DB access from Next.js; all writes go through NestJS admin API.
4. Typecheck, lint, unit tests pass across the workspace; no `any`, named
   exports, files ≤300 lines.
