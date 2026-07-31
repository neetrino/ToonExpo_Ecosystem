# City 3D Map — ինտեգրման պլան (ToonExpo)

**Status:** Done (v1 implemented)  
**Date:** 2026-07-31  
**Progress:** [`CITY_3D_MAP_PROGRESS.md`](./CITY_3D_MAP_PROGRESS.md)  
**Related:** [`MAP_REPO_STUDY.md`](./MAP_REPO_STUDY.md), [`FRONTEND_BACKEND_BOUNDARY.md`](../architecture/FRONTEND_BACKEND_BOUNDARY.md), [`TECH_CARD.md`](../TECH_CARD.md)  
**Source POC:** [ginosyan00/Map](https://github.com/ginosyan00/Map.git)

### Locked product surface (synced)

- Primary public UI: homepage MAP VIEW (`HomeDevelopmentsMap`) — MapLibre + pins + GLB + search fly-to + aside sync.
- Optional `/map` full page is not required for v1 DoD.
- No OSM extrusion replacement in v1.

---

## 0. Նպատակ (Product goal)

Platform Admin (`platform_admin`) էջից քարտեզի վրա տեղադրում է շենքերի **3D `.glb` մոդելները**, կապում է կատալոգի `Building` / `Project`-ին (հասցեով/անունով), publish անում է, և **public կայքում** բոլոր published շենքերը երևում են նույն քարտեզի վրա՝ click → շենքի/նախագծի էջ։

```text
Platform Admin editor
  → place GLB + link Building
  → NestJS + Prisma + R2
Public map
  → render all published placements
  → navigate to catalog building/project
```

---

## 1. Scope

### 1.1 In scope (v1)

| #   | Կետ                                                                                  |
| --- | ------------------------------------------------------------------------------------ |
| 1   | MapLibre basemap (OpenMapTiles-compatible, default OpenFreeMap)                      |
| 2   | Three.js custom layer — միայն **ադմինի տեղադրած** GLB-ներ (ոչ OSM extrusion replace) |
| 3   | Admin CRUD՝ create / move / rotate / scale / altitude / delete                       |
| 4   | GLB upload → Cloudflare R2 + `MediaAsset`                                            |
| 5   | Կապ `buildingId` (պարտադիր v1) + derived address `Project.address`                   |
| 6   | `draft` / `published` visibility                                                     |
| 7   | Public read-only map՝ բոլոր `published` placements                                   |
| 8   | Click / popup՝ building name + address + link to public building/project page        |
| 9   | NestJS REST + OpenAPI + RBAC (`platform_admin` write, public read)                   |
| 10  | Docs / TECH_CARD update (նոր map stack)                                              |
| 11  | Unit + API tests + հիմնական e2e smoke                                                |

### 1.2 Explicitly out of scope (v1)

| #   | Կետ                                        | Ինչու                                       |
| --- | ------------------------------------------ | ------------------------------------------- |
| 1   | OSM շենք click → hide extrusion → replace  | Բարդ, անկայուն id-ներ, պետք չէ մեր model-ին |
| 2   | Vegetation / cars / Overpass / weather     | Atmosphere only — հետո                      |
| 3   | Builder-company editor (ոչ platform admin) | Կարող է լինել v1.1                          |
| 4   | Interactive-mapping 2D hotspot merge       | Առանձին մոդուլ է մնում                      |
| 5   | Exhibition Konva map փոխել                 | Առանձին մոդուլ                              |
| 6   | Map POC Next.js `app/api` + Prisma-in-web  | Խախտում է architecture boundary             |
| 7   | localStorage որպես source of truth         | Միայն optional UI draft cache               |
| 8   | 3D Tiles / Cesium / Mapbox paid            | Ավելորդ v1-ի համար                          |
| 9   | Floor/apartment hotspots 3D mesh-ի վրա     | Առանձին epic                                |

---

## 2. Architecture որոշումներ

### 2.1 Runtime (հաստատված boundary)

```text
Browser (apps/web)
  → HTTPS REST
apps/api (NestJS)
  → packages/db (Prisma)
  → Neon PostgreSQL
  → Cloudflare R2 (GLB binaries)
```

- `apps/web` — UI only (admin editor + public viewer).
- `apps/api` — բոլոր mutations, authz, validation, media.
- **Արգելված.** Next.js route handlers / Server Actions որպես product API, Prisma `apps/web`-ից։

### 2.2 Rendering stack (առաջարկ)

| Շերտ      | Ընտրություն                           | Նշում                                           |
| --------- | ------------------------------------- | ----------------------------------------------- |
| Basemap   | `maplibre-gl`                         | Free OMT style; env-ով փոխելի                   |
| 3D models | `three` + `GLTFLoader`                | Port pattern from Map POC `CustomBuildingLayer` |
| Bridge    | MapLibre `CustomLayerInterface`       | Մեկ shared Three scene բոլոր placements-ի համար |
| UI state  | React Query + existing admin patterns | Ինչպես մյուս admin features                     |

**TECH_CARD փոփոխություն (պահանջում է հաստատում).** ավելացնել տող՝  
`City 3D map | MapLibre GL JS + Three.js | Confirmed | Platform admin placements; public read-only`.

Exhibition map մնում է Konva։ Interactive mapping մնում է 2D canvas/hotspots։

### 2.3 Ինչ ենք վերցնում Map POC-ից

| Վերցնել                                | Չվերցնել                            |
| -------------------------------------- | ----------------------------------- |
| Mercator transform + default rot X=90° | OSM identity / building-filter hide |
| `CustomBuildingLayer` pattern          | Next API routes + Prisma in Next    |
| GLB load / dispose helpers             | Vegetation, vehicles, Overpass      |
| Transform controls UX ideas            | POC Tailwind / localStorage store   |
| Sample GLB generate script (dev only)  | Write-secret auth                   |

---

## 3. Domain model

### 3.1 Նոր entity (առաջարկ)

`CityMapPlacement` (անունը հաստատելի է՝ `MapBuildingPlacement` և այլն).

| Field                                 | Type                | Notes                                                               |
| ------------------------------------- | ------------------- | ------------------------------------------------------------------- |
| `id`                                  | cuid                | PK                                                                  |
| `buildingId`                          | FK → `Building`     | **Required v1** — catalog link                                      |
| `projectId`                           | FK → `Project`      | Denormalized optional for query speed, կամ derived via building     |
| `glbMediaAssetId`                     | FK → `MediaAsset`   | R2-hosted GLB                                                       |
| `longitude`                           | Decimal             | Required                                                            |
| `latitude`                            | Decimal             | Required                                                            |
| `altitude`                            | Float               | Default `0`                                                         |
| `rotationX`                           | Float               | Degrees; default `90` (Blender Z-up)                                |
| `rotationY`                           | Float               | Degrees; default `0`                                                |
| `rotationZ`                           | Float               | Degrees; default `0`                                                |
| `scale`                               | Float               | Default `1`; validate `> 0`                                         |
| `minZoom`                             | Int                 | Default `13`                                                        |
| `publicationStatus`                   | `PublicationStatus` | `draft` \| `published` (և եղած enum-ի մյուս արժեքները եթե կիրառելի) |
| `labelOverride`                       | String?             | Optional display name; else `Building.name`                         |
| `createdByUserId` / `updatedByUserId` | String?             | Audit                                                               |
| `createdAt` / `updatedAt`             | DateTime            |                                                                     |

**Constraints (առաջարկ).**

- Մեկ `buildingId` → **առավելագույնը մեկ** active placement (unique `buildingId`), որպեսզի չկրկնվի։
- Public API վերադարձնում է միայն `published` + building/project նույնպես published (կամ explicit policy՝ ստորև §3.3).

### 3.2 Address / linking UX

Հասցեն **չենք duplicate անում** placement row-ում.

Admin flow.

1. Search building by name / project name / `Project.address` / city.
2. Select `Building`.
3. Place on map (click map կամ use `Project.latitude/longitude` որպես initial pin, եթե կա).
4. Upload GLB.
5. Adjust transform.
6. Save as draft → Publish.

Public popup.

- Title: `Building.name` (կամ `labelOverride`)
- Subtitle: `Project.address` (+ city)
- CTA: open public project/building URL

### 3.3 Visibility policy (հաստատման կետ)

| Option | Կանոն                                                                  | Առաջարկ                  |
| ------ | ---------------------------------------------------------------------- | ------------------------ |
| A      | Placement `published` AND Building `published` AND Project `published` | **Այո (recommended)**    |
| B      | Միայն placement `published`                                            | Ռիսկ՝ draft catalog երևա |
| C      | Placement published + project published (building կարող է draft)       | Չէ                       |

**Recommendation:** Option A.

### 3.4 Media

- Extend `MediaAssetType` with `model3d` (կամ `glb`) — **schema approval**.
- Max size՝ env `CITY_MAP_MAX_GLB_BYTES` (default 25 MB, համաձայնեցնել).
- Allowed MIME / extension՝ `.glb` only in v1.
- Upload flow՝ գոյություն ունեցող media upload service pattern (R2), ոչ raw Next upload.

---

## 4. API design (NestJS)

### 4.1 Admin (platform_admin)

| Method   | Path                                       | Purpose                                            |
| -------- | ------------------------------------------ | -------------------------------------------------- |
| `GET`    | `/admin/city-map/placements`               | List (filters: status, projectId, q)               |
| `GET`    | `/admin/city-map/placements/:id`           | Detail                                             |
| `POST`   | `/admin/city-map/placements`               | Create (buildingId + transform + glbMediaAssetId)  |
| `PATCH`  | `/admin/city-map/placements/:id`           | Update transform / media / status / label          |
| `DELETE` | `/admin/city-map/placements/:id`           | Delete placement (media retention policy՝ առանձին) |
| `POST`   | `/admin/city-map/placements/:id/publish`   | Publish (optional convenience)                     |
| `POST`   | `/admin/city-map/placements/:id/unpublish` | Unpublish                                          |

Building search կարող է reuse անել գոյություն ունեցող catalog admin endpoints, կամ thin `GET /admin/city-map/building-options?q=`.

### 4.2 Public

| Method | Path                          | Purpose                                                                 |
| ------ | ----------------------------- | ----------------------------------------------------------------------- |
| `GET`  | `/public/city-map/placements` | Published placements + building/project summary + signed/public GLB URL |
| `GET`  | `/public/city-map/config`     | Style URL, default center/zoom/pitch/bearing (non-secret)               |

### 4.3 Contracts

- DTO-ներ `packages/contracts`-ում (zod/OpenAPI-aligned, ինչպես մյուս մոդուլները).
- Validate բոլոր numeric bounds (lat/lng ranges, scale min/max, altitude max).

### 4.4 AuthZ

| Actor                     | Read admin | Write   | Public read  |
| ------------------------- | ---------- | ------- | ------------ |
| `platform_admin`          | Yes        | Yes     | Yes          |
| `company_admin` / builder | No (v1)    | No (v1) | Yes (public) |
| Anonymous / buyer         | No         | No      | Yes          |

---

## 5. Frontend plan (`apps/web`)

### 5.1 Feature module

```text
apps/web/src/features/city-map/
  api/
  components/
    CityMapView.tsx          # shared MapLibre shell
    CityMapGlbLayer.ts       # Three custom layer
    AdminPlacementEditor.tsx
    AdminPlacementList.tsx
    PublicPlacementPopup.tsx
  hooks/
  types/
  constants/
```

Shared map shell օգտագործվում է և admin, և public էջերում (props՝ `mode: "edit" | "view"`).

### 5.2 Routes

| Route                                    | Role                    |
| ---------------------------------------- | ----------------------- |
| `/[locale]/admin/city-map`               | List + map editor entry |
| `/[locale]/admin/city-map/[placementId]` | Optional detail editor  |
| `/[locale]/map` կամ `/[locale]/city-map` | Public map page         |

Exact public path — UX/i18n հաստատում։

### 5.3 Admin UX (v1)

1. Full-bleed map + side panel.
2. «Add building» → search catalog building → place pin.
3. Upload GLB / replace GLB.
4. Transform sliders/inputs (lng, lat, alt, rot X/Y/Z, scale, minZoom).
5. Draft / Publish / Delete.
6. List of placements with status badges.
7. Optional. «Fly to» selected placement.

### 5.4 Public UX (v1)

1. Same basemap + all published GLBs.
2. Click model or marker → popup (name, address, CTA).
3. Deep-link query optional՝ `?buildingId=` fly-to.
4. Mobile. pan/zoom/pitch; keep UI minimal (hero budget rules չեն կիրառվում admin tool-ին).

### 5.5 Dependencies (`apps/web`)

```text
maplibre-gl
three
@types/three (dev)
```

Pin exact versions after spike (prefer Map POC–compatible majors՝ maplibre 5.x, three 0.185.x — verify license/security).

### 5.6 Env (web)

```env
NEXT_PUBLIC_CITY_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
NEXT_PUBLIC_CITY_MAP_CENTER_LNG=44.5152
NEXT_PUBLIC_CITY_MAP_CENTER_LAT=40.1872
NEXT_PUBLIC_CITY_MAP_INITIAL_ZOOM=14
NEXT_PUBLIC_CITY_MAP_INITIAL_PITCH=55
NEXT_PUBLIC_CITY_MAP_INITIAL_BEARING=-20
```

Secret tokens **ոչ** `NEXT_PUBLIC_*`. Self-hosted tiles URL optional later.

---

## 6. Implementation phases

### Phase 0 — Հաստատումներ (blocker)

| #    | Որոշում                                | Options                             | Recommendation          |
| ---- | -------------------------------------- | ----------------------------------- | ----------------------- |
| P0.1 | Ավելացնել MapLibre+Three TECH_CARD-ում | Yes / No                            | **Yes**                 |
| P0.2 | Entity name                            | `CityMapPlacement` / այլ            | `CityMapPlacement`      |
| P0.3 | `buildingId` unique                    | 1:1 / many models per building      | **1:1 v1**              |
| P0.4 | Visibility                             | A/B/C (§3.3)                        | **A**                   |
| P0.5 | Public route path                      | `/map` / `/city-map` / home section | **`/map`** (քննարկել)   |
| P0.6 | Who can edit v1                        | platform_admin only / + builders    | **platform_admin only** |
| P0.7 | Max GLB size                           | 10 / 25 / 50 MB                     | **25 MB**               |
| P0.8 | OSM extrusion hide                     | Skip / include                      | **Skip v1**             |

**Gate.** Phase 1 չի սկսվում մինչև P0-ն հաստատված չէ։

---

### Phase 1 — Spike (apps/web only, 1–2 օր)

| #   | Deliverable                                                | Done when                     |
| --- | ---------------------------------------------------------- | ----------------------------- |
| 1.1 | Install `maplibre-gl` + `three`                            | Builds / typecheck            |
| 1.2 | Lab page (admin-only or hidden)՝ basemap + 1 hardcoded GLB | Visual OK desktop+mobile      |
| 1.3 | Port minimal custom layer (load, transform, dispose)       | No WebGL leak on unmount      |
| 1.4 | Spike notes (perf, pitfalls)                               | Short note in this doc or ADR |

**No** Prisma / Nest yet։ Fake JSON fixture OK.

---

### Phase 2 — Data + API

| #   | Deliverable                                           | Done when                            |
| --- | ----------------------------------------------------- | ------------------------------------ |
| 2.1 | Prisma model + migration in `packages/db`             | Migrate clean                        |
| 2.2 | `MediaAssetType` extension + upload allowlist for GLB | Upload works via existing media flow |
| 2.3 | Nest module `city-map` (controller/service/dto)       | OpenAPI generated                    |
| 2.4 | Admin CRUD + authz guards                             | Tests green                          |
| 2.5 | Public list endpoint + visibility policy A            | Only correct rows returned           |
| 2.6 | Contracts package types/schemas                       | Web can import                       |

---

### Phase 3 — Admin editor (production UI)

| #   | Deliverable                         | Done when               |
| --- | ----------------------------------- | ----------------------- |
| 3.1 | `/admin/city-map` page in admin nav | Discoverable            |
| 3.2 | Building search → link              | Linked building saved   |
| 3.3 | Map click place + transform panel   | Persists via API        |
| 3.4 | GLB upload → media → placement      | R2 URL loads in layer   |
| 3.5 | Publish / unpublish / delete        | Status reflected public |
| 3.6 | Empty / error / loading states      | No silent failures      |
| 3.7 | i18n strings (hy/ru/en)             | next-intl keys          |

---

### Phase 4 — Public map

| #   | Deliverable                                   | Done when                   |
| --- | --------------------------------------------- | --------------------------- |
| 4.1 | Public route + SEO basics (title/description) | Indexed intentionally       |
| 4.2 | Load published placements + render all GLBs   | N models in one Three layer |
| 4.3 | Popup + navigation to catalog pages           | Correct locale links        |
| 4.4 | `?buildingId=` deep-link fly-to               | Works                       |
| 4.5 | Performance budget check (few dozen models)   | Document limits             |

---

### Phase 5 — Hardening + docs

| #   | Deliverable                                          | Done when           |
| --- | ---------------------------------------------------- | ------------------- |
| 5.1 | API unit/integration tests                           | CI green            |
| 5.2 | Playwright smoke (admin create → public visible)     | E2E green           |
| 5.3 | Update TECH_CARD, module docs, `.env.example`        | Docs match behavior |
| 5.4 | Sentry wrapping for map init failures                | Errors observable   |
| 5.5 | Known limits doc (GLB size, model count, mobile GPU) | Linked from README  |

---

## 7. Non-goals / future (v1.1+)

| Item                                   | Notes                         |
| -------------------------------------- | ----------------------------- |
| Builder self-service placements        | Company-scoped authz          |
| Multiple GLBs per building             | Relax unique                  |
| OSM footprint hide under custom model  | Needs stable tile ids / ETL   |
| Vegetation / traffic atmosphere        | From Map POC later            |
| Click 3D → floor hotspot handoff       | Bridge to interactive-mapping |
| Search box on public map by address    | Nice-to-have                  |
| Clustering / LOD for 100+ heavy models | If scale requires             |

---

## 8. Risks և mitigations

| Risk                             | Impact | Mitigation                                         |
| -------------------------------- | ------ | -------------------------------------------------- |
| Heavy GLBs kill mobile GPU       | High   | Size limit, compress GLB, minZoom, count soft-cap  |
| Wrong Blender orientation        | Medium | Default rotX=90, admin preview, docs for exporters |
| R2/CORS for GLB fetch            | Medium | Public CDN URL + CORS check in spike               |
| MapLibre + Three context loss    | Medium | Dispose on unmount; reload UX                      |
| Catalog unpublished still linked | Medium | Visibility policy A                                |
| Scope creep (OSM replace, trees) | High   | Strict out-of-scope list; separate epics           |
| TECH_CARD / stack approval delay | Medium | Phase 0 gate before coding                         |

---

## 9. Acceptance criteria (v1 DoD)

- [x] Platform admin-ը կարող է ստեղծել placement՝ կապված գոյություն ունեցող `Building`-ի հետ։
- [x] GLB-ն պահվում է R2-ում և վերաբեռնվում է editor-ում։
- [x] Transform-ները պահպանվում են և վերականգնվում են refresh-ից հետո (API, ոչ localStorage).
- [x] Draft placement-ը **չի** երևում public map-ում։
- [x] Published placement-ը երևում է public map-ում միայն եթե building+project published են։
- [x] Public click-ը ցույց է տալիս անուն + հասցե և տանում է ճիշտ catalog էջ։
- [x] Բոլոր write-երը անցնում են NestJS + RBAC։
- [x] Չկա Prisma / product API `apps/web`-ում։
- [x] Lint, typecheck, unit tests, smoke e2e՝ green։
- [x] Docs + TECH_CARD + `.env.example` թարմացված։

---

## 10. Effort estimate (կոպիտ)

| Phase                  | Effort                      |
| ---------------------- | --------------------------- |
| Phase 0 approvals      | 0.5 day (meetings)          |
| Phase 1 spike          | 1–2 days                    |
| Phase 2 data/API       | 2–3 days                    |
| Phase 3 admin UI       | 3–4 days                    |
| Phase 4 public UI      | 2–3 days                    |
| Phase 5 hardening/docs | 1–2 days                    |
| **Total**              | **~10–14 engineering days** |

Առանց OSM-replace / vegetation — շատ ավելի կարճ, քան ամբողջ Map POC port-ը։

---

## 11. File / module checklist (իրականացման ժամանակ)

| Area         | Paths (expected)                                                            |
| ------------ | --------------------------------------------------------------------------- |
| Prisma       | `packages/db/prisma/models/…` + migration                                   |
| Contracts    | `packages/contracts/…`                                                      |
| API          | `apps/api/src/city-map/…`                                                   |
| Web feature  | `apps/web/src/features/city-map/…`                                          |
| Admin pages  | `apps/web/src/app/[locale]/admin/city-map/…`                                |
| Public pages | `apps/web/src/app/[locale]/map/…` (TBD)                                     |
| Env          | root `.env.example`, web/api env docs                                       |
| Docs         | this plan → later module doc under `docs/02-ToonExpo-Ecosystem/01-Modules/` |

---

## 12. Հաստատման խնդրանք

Խնդրում ենք հաստատել **Phase 0** աղյուսակի բոլոր կետերը (P0.1–P0.8)։  
Հաստատումից հետո սկսում ենք **Phase 1 spike** (առանց schema merge մինչև Phase 2 approval-ը schema PR-ի վրա)։

**Ամփոփ առաջարկ.** թեթև City 3D Map՝ MapLibre + Three + Nest/R2 + `CityMapPlacement`↔`Building`, առանց OSM extrusion replacement-ի։
