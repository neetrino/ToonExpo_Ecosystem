# City 3D Map — Progress Checklist

**Status:** Done (v1 implementation)  
**Last updated:** 2026-07-31  
**Plan:** [`CITY_3D_MAP_INTEGRATION_PLAN.md`](./CITY_3D_MAP_INTEGRATION_PLAN.md)

---

## Foundation

- [x] `CITY_3D_MAP_PROGRESS.md` ստեղծված
- [x] TECH_CARD. City 3D map = MapLibre + Three
- [x] INTEGRATION_PLAN status → In progress / Done
- [x] City map style/camera/GLB limits — **code defaults only** (no env required)

## Spike

- [x] `maplibre-gl` + `three` + `@types/three` installed (pinned)
- [x] Admin lab/editor page renders basemap (`/admin/city-map`)
- [x] One GLB via CustomLayerInterface (placeholder box fallback)
- [x] Unmount dispose (no WebGL leak)
- [x] R2/public URL CORS — uses existing R2 public URL pattern (verify in env)

## Data / API

- [x] Prisma `CityMapPlacement` + migration
- [x] Relations on `Building` / `MediaAsset`
- [x] `MediaAssetType.model3d` + upload allowlist (.glb, 25MB)
- [x] Contracts DTOs/schemas in `packages/contracts`
- [x] Nest module registered (`CityMapModule`)
- [x] Admin `GET/POST/PATCH/DELETE` `/admin/city-map/placements`
- [x] Admin `POST .../publish` + `.../unpublish`
- [x] Admin `GET /admin/city-map/building-options`
- [x] Public `GET /public/city-map/placements`
- [x] Public `GET /public/city-map/config`
- [x] RBAC. platform_admin write; public read anonymous OK
- [x] API unit/integration tests (`city-map.service.spec.ts`)
- [x] OpenAPI docs for new endpoints (`@ApiTags`)

## Admin UI

- [x] Nav item in `admin-nav-items.ts`
- [x] `/[locale]/admin/city-map` page
- [x] Placement list + status badges
- [x] Building search → link `buildingId`
- [x] Map click place + Project lat/lng prefill
- [x] Pin markers on map for all placements
- [x] Admin search → immediate fly-to
- [x] GLB upload / replace via media API
- [x] Transform panel
- [x] Draft / Publish / Unpublish / Delete
- [x] Fly-to selected placement
- [x] Loading / empty / error states
- [x] i18n hy/ru/en for admin strings

## Public UI (homepage MAP VIEW)

- [x] Replace placeholder in `HomeDevelopmentsMap` with live MapLibre
- [x] Render published GLB placements
- [x] Pin/point layer for published placements
- [x] Search box → select + flyTo
- [x] Remove mapPlaceholder overlay when live
- [x] Click GLB / pin → sync aside
- [x] Click list → fly-to pin + highlight
- [x] Projects without placement stay list-only
- [x] Mobile pan/zoom/pitch usable
- [x] i18n for search / live map strings

## Public UI (optional /map)

- [ ] N/A Optional `/[locale]/map` full-page (deferred — home MAP VIEW is primary)
- [ ] N/A Optional deep-link (deferred)

## Hardening / docs

- [x] Manual smoke checklist (below)
- [x] Playwright smoke e2e (`apps/web/e2e/src/city-map.spec.ts`) — admin editor + homepage canvas
- [x] Unit tests: service (incl. public visibility filter), mappers, GLB validation, web constants/pins
- [x] Admin draft vs published pin colors
- [x] MapLibre CSP worker synced to `public/maplibre` (production/Turbopack-safe)
- [x] Sentry on map init failures
- [x] Module doc `docs/02-ToonExpo-Ecosystem/01-Modules/18-City-3D-Map.md`
- [x] Admin Blender export note
- [x] Known limits documented
- [x] All v1 boxes `[x]`; status = Done

### Manual smoke

1. Migrate DB (`pnpm --filter @toonexpo/db db:migrate:deploy`)
2. As platform_admin open `/admin/city-map`
3. Search building → place pin → upload GLB → save → publish
4. Open homepage → MAP VIEW shows pin + model; search fly-to; aside syncs

## Out of scope (N/A v1)

- N/A OSM extrusion hide
- N/A Vegetation / vehicles / weather
- N/A Builder company editor
- N/A Interactive-mapping 2D merge
- N/A Exhibition Konva changes
- N/A Next.js product API / Prisma in web
- N/A localStorage as source of truth
- N/A Multiple GLBs per building
- N/A 3D floor hotspots on mesh
- N/A Mapbox / Cesium / 3D Tiles
- N/A Self-hosted tiles rewrite

## Notes / blockers

- Run migration on Neon before using admin UI in a shared environment.
- GLB upload requires R2 env configured.
- Production MapLibre requires `public/maplibre/maplibre-gl-csp-worker.js` (auto-synced via `pnpm --filter @toonexpo/web prebuild`).
- Optional `/map` page remains deferred — homepage MAP VIEW is the v1 public surface.
- Manual end-to-end: place + publish a real GLB once, then confirm homepage pins/models (seed has no city-map placements).
