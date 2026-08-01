# 3D Map — Implementation Plan

**Status:** v1 complete (stages 1–6 done; final control passed 2026-08-01) ·
**Owner:** Orchestrator (Fable 5) · **Created:** 2026-07-31

Remaining production follow-ups: reverse apartments-map sync
(pending owner decision).

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
- No LOD pipeline for v1 (viewport-based loading is enough at ≤1000 models).
- No Three.js custom layer (deck.gl `ScenegraphLayer` remains the renderer).

### Stage 2b+ (2026-08-01) — OSM pick + unassigned placements

Admin can click an OSM `building-3d` extrusion (cyan footprint highlight), place a
GLB at the footprint centroid (or empty map), optionally without a project, then
attach a project later. Hide uses `sourceOsmId` filter when available, plus the
existing distance mask. Publish requires an attached project; public list is
`isPublished && projectId != null`.

### Future polish backlog (not in current scope)

- Sparse cars only near viewport/camera focus (performance-safe).
- Richer trees / water / grass — minimal “life”, not a sim.
- Yerevan pink-tuff brand paint on the basemap.

## Data model (packages/db)

Prisma model file `packages/db/prisma/models/geo-map.prisma`:

```
model ProjectMapModel {
  id            String   @id @default(cuid())
  projectId     String?  @unique              // optional; one model per project when set
  mediaAssetId  String                        // GLB file in R2 (MediaAsset)
  sourceOsmId   String?                       // hide OSM extrusion when present in tiles
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
indexes, relation `onDelete` rules). Relation: `Project 1—0..1 ProjectMapModel`
(optional; `onDelete: SetNull`), `MediaAsset 1—N ProjectMapModel`.

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

- `GET /public/geo-map/models` — published + attached (`projectId` not null);
  compact payload: project id/slug/name, `logoUrl`, `sourceOsmId`, marker data,
  model URL + transform + minZoom.

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

| #   | Scope                                                                                        | Model             | Status |
| --- | -------------------------------------------------------------------------------------------- | ----------------- | ------ |
| 1   | DB schema + migration + `geo-map` API module + media `model3d` kind + contracts + unit tests | Grok 4.5 High     | done   |
| 2a  | `GeoMapCanvas` core: MapLibre + deck.gl integration, marker/model zoom switch                | Sonnet 5 High     | done   |
| 2b  | Admin editor page: panel UI, upload flow, transform controls, wiring to API                  | Grok 4.5 High     | done   |
| 3   | Public map page (reuse `GeoMapCanvas`, read-only)                                            | Composer 2.5 Fast | done   |
| 4   | Map styling (brand colors, OSM building extrusions), polish, i18n strings                    | Grok 4.5 High     | done   |
| 5   | Home page map: replace test map with `GeoMapCanvas` + project search                         | Grok 4.5 High     | done   |
| 6   | Apartments page: interactive map synced with apartment selection                             | Grok 4.5 High     | done   |

### Stage 5 — Home page map

Replace the current test map on the home page
(`apps/web/src/features/catalog/components/home-developments-map.tsx`,
used from `app/[locale]/page.tsx` via `home-developments`) with the real
`GeoMapCanvas` showing published project models. Add a project search box:
selecting a result flies the camera to that project's model. Requires a small
backward-compatible `GeoMapCanvas` extension: imperative focus/fly-to API
(e.g. `focusObjectId` prop or ref handle) — also needed by Stage 6.

**Done:** `focusRequest?: { objectId; zoom?; token }` + optional
`highlightedObjectId` on `GeoMapCanvas` (pure `resolveFocusCamera` util +
unit tests). Home map uses `GET /geo-map/models` via
`usePublicGeoMapModelsQuery`, client-side label search with keyboard nav,
click → project page via `buildProjectPublicHref`.

### Stage 6 — Apartments page map

On `apps/web/src/app/[locale]/apartments` add/replace the map with
`GeoMapCanvas`. Hovering an apartment card in the list highlights and flies to
the 3D model of the project the apartment belongs to (apartment → project →
map model). Reverse direction (click model → filter apartment list) is
implemented on the apartments page only.

**Done:** Replaced the static Buy-page map image with `GeoMapCanvasLazy`
(published models via `usePublicGeoMapModelsQuery`). Cards keep navigating
to the apartment on click. **List → map sync is card hover** (mouse enter):
resolves `listing.projectId` via `resolveMapObjectForProject`, then sets
`focusRequest` + `highlightedObjectId` for that project's published 3D model.
Mouse leave clears highlight only (camera is not reset, to avoid jitter);
hover is debounced (~80ms). The previous **Show on map** button UX was
removed — hover replaces it. Pure util `resolveMapObjectForProject` + unit
tests.

**Reverse sync (done):** On the apartments page only, map marker/model click
filters the listing grid to that project's apartments (`listing.projectId`)
and highlights the model — it does **not** navigate away. A filter chip shows
the project name, **Open project** (`buildProjectPublicHref`), and
**All apartments** to clear. Pure util `filterListingsByProjectId` + unit
tests. `/map` and home keep click → project page.

**Decision:** Card hover is the primary list→map sync. Model click still
sets the project filter chip (explicit map→list). The two coexist: hover
does not set/clear the filter; leave clears highlight only.

### Production follow-up (final control stage)

**Done:** R2 bucket CORS is configured (`Access-Control-Allow-Origin: *`,
methods GET/HEAD). GLBs load directly from `pub-*.r2.dev`; the same-origin
`/r2-proxy/*` rewrite and `resolveModelAssetUrl` helper were removed.

Stage rules:

- Each stage ends with a **conventional commit** followed by an immediate
  **push** to the current branch (`git push origin <branch>`).
- Each stage verifies only affected packages (typecheck + lint + unit tests);
  full workspace verification is done once by the orchestrator at the end.
- Stage 2a must expose a typed props API so 2b and 3 can consume it without
  touching its internals.

## Acceptance criteria (v1 done)

1. Super admin opens "3D Map", uploads a GLB, places/moves/rotates/scales it,
   publishes — data persisted via API in PostgreSQL, file in R2.
2. Public map shows always-visible teal dots at all zooms and 3D models above
   `minZoom`; hover/select shows logo + name card; click opens the project.
3. No Prisma/DB access from Next.js; all writes go through NestJS admin API.
4. Typecheck, lint, unit tests pass across the workspace; no `any`, named
   exports, files ≤300 lines.

## Stage 4 notes

- Brand look is applied as **paint overrides** on OpenFreeMap liberty layer ids
  (see `apps/web/src/features/geo-map/utils/apply-brand-map-style.ts`), not a
  forked style JSON. Attribution remains MapLibre’s default control.
- Liberty already ships `building-3d` fill-extrusions; Stage 4 restyles them
  (muted gray, min zoom 15) so GLB models sit in city context.
- **Follow-up (done):** OSM extrusions under GLBs are hidden with a MapLibre
  `distance` filter on liberty `building-3d` (~80 m around each visible model
  anchor). Coverage pads alone cannot subtract hollow fill-extrusions; true
  geometry clipping needs custom tiles.
- **Done:** R2 bucket CORS allows direct GLB fetches from `pub-*.r2.dev`; the
  `/r2-proxy/*` rewrite was removed.
- Scenegraph layers render via `MapboxOverlay` with `interleaved: false` (and
  `_lighting: 'pbr'`) so GLBs stay visible above MapLibre depth/stencil and
  textured materials read more realistically than flat unlit shading. If a GLB
  still looks washed or mirror-black after PBR, escalate (authoring materials /
  Three.js path) rather than reintroducing a warm `getColor` wash.
- **Admin live transform preview:** Sidebar sliders (position, altitude, rotate
  X/Y/Z, scale, minZoom) update the map immediately via an in-memory
  `transformOverride` on `GeoMapCanvas`. **Save** PATCHes the API/DB. **Publish**
  remains a separate flag — the public map still only lists
  `isPublished && projectId != null`. Drag-to-move still PATCHes lng/lat on drop
  and wins over the preview while dragging.
- **Default model pitch 90° (POC parity):** deck.gl `ScenegraphLayer`
  `getOrientation` is `[pitch, yaw, roll]`. Typical Y-up glTF/GLB assets
  (including Map POC `Building01.glb`) need `pitchDeg: 90` to stand upright on
  MapLibre — matches POC “Rotation X = 90°”. Prisma column default stays `0`
  for schema stability; admin create + Nest create defaults send
  `GEO_MAP_DEFAULT_PITCH_DEG = 90`. Selection must not multiply mesh color
  (warm `getColor` wash reads as a solid yellow slab); keep opaque white
  `getColor` and show selection via pin / chrome / info card only.
- When interleaved mode is re-enabled later, use `beforeId: boundary_3` so
  models draw above `building-3d` extrusions.

## Polish

- **Always-visible project pins (done):** Every published map object renders as a
  ~24×32px brand-teal MapPin (filled Lucide-style SVG, white stroke + hole,
  drop shadow) at all zooms — including while the GLB is visible. Hovered /
  `highlightedObjectId` pins switch to dark (`text-ink`). Project name lives in
  the shared `GeoMapInfoCard` (logo + name) on the canvas — not as a name pill
  on the pin — so home, `/map`, and apartments share one UX. Public payload
  includes `logoUrl` from `builderCompany.logoMedia`.
- **Default pitched camera (done):** Default `GeoMapCanvas` path mounts at
  pitch 0 for a fast first paint, then eases once to `DEFAULT_MAP_PITCH_DEG`
  (55°, same as `FOCUS_PITCH_DEG`) after style idle. Explicit `initialPitch`
  (lab/tests) skips the ease and starts at that pitch. `maxPitch` is 85°;
  `dragRotate` / `touchPitch` / `touchZoomRotate` stay enabled. Users rotate via
  right-drag or Ctrl+drag, the pitched compass (`NavigationControl`), or the
  compact tilt +/− / reset controls under the compass. Optional
  `initialBearing` overrides the north-up default.

## Performance

- **Viewport sync:** `useMapViewportState` rAF-coalesces `move` and only
  `setState`s when quantized zoom (2 dp) + bounds signature change — cuts
  React → model/marker array → ScenegraphLayer / OSM `setFilter` thrash while
  tilting.
- **Guarded updates:** Footprint mask skips `setFilter` when model id/position
  signature is unchanged; deck rebuilds ScenegraphLayer only when object pose /
  quantized fade opacity change (selection is chrome-only, not mesh tint).
  Opacity is stepped so zoom ticks do not recreate layers.
- **Cold start:** MapLibre ctor uses `fadeDuration: 0`, `canvasContextAttributes.antialias: false`, and
  `pixelRatio` capped at 2; pitch eases 0→55 after idle (see above).
- **Lazy deck:** `MapboxOverlay` mounts only while viewport-visible GLB models
  exist; safe remount when models appear later.
- **Deferred (not in this pass):** structural ScenegraphLayer identity across
  updates, `interleaved: true`, and a lighter basemap / `building-3d` strategy.
