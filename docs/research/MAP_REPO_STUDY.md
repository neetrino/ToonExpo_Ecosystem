# Map repo ուսումնասիրություն — ինտեգրման նախապատրաստում

**Աղբյուր:** [ginosyan00/Map](https://github.com/ginosyan00/Map.git) (fork՝ `Manvel-Lambaryan/Map`)  
**Ուսումնասիրվել է:** 2026-07-31  
**Նպատակ:** ամփոփել stack-ը, հնարավորությունները և ToonExpo-ում ինտեգրման սահմանները՝ նախքան իրականացումը։

---

## 1. Ինչ է այս repo-ն

Standalone **POC** (ոչ production product)՝ OpenMapTiles-compatible վեկտոր քարտեզի վրա.

1. Բացվում է 3D extruded շենքերի շերտ (`fill-extrusion`).
2. Օգտագործողը սեղմում է շենք → highlight + հատկությունների panel.
3. Upload / URL / sample **`.glb`** մոդել է կիրառվում նույն աշխարհագրական կետում.
4. Հնարավորության դեպքում թաքցվում է միայն այդ շենքի extrusion-ը (style filter).
5. Transform-ները (lng/lat/altitude/rotation/scale) պահպանվում են և վերաբեռնվում.

Կարճ անուն repo-ում՝ **`omt-glb-poc`** (OpenMapTiles Custom GLB POC).

Demo / about: [map-chi-lyart.vercel.app](https://map-chi-lyart.vercel.app)

---

## 2. Stack և dependencies

| Շերտ                      | Տեխնոլոգիա                                              | Տարբերակ (repo-ում)               |
| ------------------------- | ------------------------------------------------------- | --------------------------------- |
| Framework                 | Next.js (App Router)                                    | 16.2.10                           |
| UI                        | React + React DOM                                       | 19.2.4                            |
| Language                  | TypeScript                                              | ^5                                |
| Styles                    | Tailwind CSS 4                                          | ^4                                |
| Map renderer              | **MapLibre GL JS**                                      | ^5.24.0                           |
| 3D models                 | **Three.js** + `GLTFLoader`                             | ^0.185.1                          |
| Map↔3D bridge             | MapLibre `CustomLayerInterface` (`renderingMode: "3d"`) | —                                 |
| DB (optional persistence) | Prisma 7 + `pg` + `@prisma/adapter-pg`                  | ^7.9.0                            |
| Hosted DB target          | Neon PostgreSQL                                         | env `DATABASE_URL` / `DIRECT_URL` |
| Package manager           | pnpm                                                    | 11.13.0                           |
| Lint / format             | ESLint 9 + Prettier                                     | —                                 |

**Կարևոր.** Mapbox paid SDK **չի օգտագործվում**. Basemap-ը OpenMapTiles-compatible style է (default՝ OpenFreeMap Liberty).

### Հիմնական npm packages (runtime)

```text
maplibre-gl
three
next, react, react-dom
@prisma/client, @prisma/adapter-pg, pg
```

---

## 3. Արտաքին սերվիսներ / tiles

| Ծառայություն                            | Դեր                                | Env                                |
| --------------------------------------- | ---------------------------------- | ---------------------------------- |
| OpenFreeMap Liberty (կամ այլ OMT style) | Vector basemap + buildings schema  | `NEXT_PUBLIC_MAP_STYLE_URL`        |
| Self-hosted PBF (optional)              | Style-ի vector `tiles` rewrite     | `NEXT_PUBLIC_MAPTILES_URL`         |
| Terrarium / DEM TileJSON (optional)     | Terrain elevation                  | `NEXT_PUBLIC_TERRAIN_TILEJSON_URL` |
| Overpass API                            | OSM roads → մեքենաների սիմուլյացիա | `NEXT_PUBLIC_OVERPASS_URL`         |
| Neon Postgres                           | `BuildingReplacement` persistence  | `DATABASE_URL`, `DIRECT_URL`       |

Default camera (env)՝ Երևան մոտ (`~44.52, 40.21`), zoom ~18, pitch/bearing F4map-style presets.

---

## 4. Հիմնական հնարավորություններ

### 4.1 Core (POC նպատակ)

| Feature                    | Ինչպես է աշխատում                                              |
| -------------------------- | -------------------------------------------------------------- |
| 3D buildings               | Detect կամ create `fill-extrusion` layer (`building-layer.ts`) |
| Building click / selection | `queryRenderedFeatures` → `SelectedBuilding`                   |
| Highlight                  | GeoJSON fill / line / extrusion layers                         |
| GLB replacement            | Մեկ shared Three.js scene՝ `CustomBuildingLayer`               |
| Hide original              | Style filter merge (`osm_id` / custom prop / feature id)       |
| Transform UI               | lng, lat, altitude, rot X/Y/Z (°), scale, minZoom              |
| Persist (client)           | `localStorage` key `omt-glb-poc:custom-buildings:v1`           |
| Persist (server)           | Prisma `BuildingReplacement` + `/api/replacements`             |
| Export / import            | JSON config (`ConfigExport` v1)                                |
| Sample GLB                 | `/models/sample-building.glb` + generate script                |

### 4.2 Ընդլայնված (POC-ից հետո ավելացված)

| Feature                      | Նշում                                                   |
| ---------------------------- | ------------------------------------------------------- |
| Vegetation / 3D trees        | InstancedMesh, park polygon sampling, LOD               |
| Vehicle traffic              | Overpass roads + Three.js car models                    |
| Atmosphere / weather overlay | Visual polish                                           |
| Terrain                      | Best-effort DEM draping                                 |
| Camera presets               | Idle orbit, cinematic fly-to, share URL (`?lng&lat&z…`) |
| Graphic options panel        | Quality / visual toggles                                |
| Model upload API             | `/api/models` (+ write secret)                          |

---

## 5. Architecture (կարճ)

```text
MapLibre map
 ├─ vector fill-extrusion buildings
 ├─ GeoJSON highlight / replaced-cover / preserved parts
 ├─ custom Three.js layer — GLB building replacements
 ├─ custom Three.js layer — vegetation (instanced trees)
 └─ custom Three.js layer — vehicles (optional)
```

### Data flow (building replace)

```text
click → queryRenderedFeatures → SelectedBuilding
      → highlight GeoJSON
      → Apply Replacement → CustomBuildingModel[]
      → CustomBuildingLayer.setModels / updateTransforms
      → building-filter exclusions
      → localStorage և/կամ PUT /api/replacements
```

### Rendering նշումներ

- MapLibre-ն ունի WebGL context-ը; Three.js `WebGLRenderer`-ը կառուցվում է `{ canvas, context }` map-ից.
- Transform փոփոխությունները **միայն matrix** են թարմացնում — GLB-ն չի reload լինում ամեն drag-ի վրա.
- `render()`-ը **չի** կանչում `triggerRepaint()` (infinite loop-ից խուսափելու համար).

---

## 6. Կոդի կառուցվածք (աղբյուր)

```text
src/
  app/                    # Next.js pages + API routes
    api/
      health/
      models/             # GLB upload / fetch
      replacements/       # CRUD sync BuildingReplacement
      roads/              # Overpass proxy-ish
      sample-building/
  components/
    map/                  # MapView, CustomBuildingLayer, vehicles, vegetation
    building-editor/      # Panel, uploader, transforms, lists
    layout/
  hooks/                  # selection, persist, model loader, graphics, share
  lib/
    map/                  # style, filter, identity, terrain, atmosphere…
    three/                # load/prepare/dispose GLB
    vegetation/           # park sampling, instancing, LOD
    storage/              # sanitize, materialize data URLs
    db/                   # Prisma helpers
    api/                  # write-auth
  types/                  # building.ts, map.ts, vegetation.ts
prisma/
  schema.prisma           # BuildingReplacement
docs/                     # architecture, limitations, trees, testing
public/models/            # sample GLB + tree assets
```

### Կենտրոնական տիպեր

- `BuildingIdentity` — `osm-id` | `custom-id` | `feature-id` | `geometry-hash`
- `SelectedBuilding` — geometry, centroid, filter strategy, properties
- `CustomBuildingModel` — modelUrl + transform + footprint + hideWarning

Identity priority (տես նաև `docs/building-identification.md` աղբյուրում).

1. `osm_id` (և aliases)
2. custom property (`custom_model_id`, …)
3. vector feature id
4. geometry hash (միայն local key — **ոչ** MapLibre style filter)

---

## 7. Prisma schema (Map repo)

```prisma
model BuildingReplacement {
  id        String   @id @db.VarChar(128)
  payload   Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("building_replacements")
}
```

Write endpoints պաշտպանված են `REPLACEMENTS_WRITE_SECRET` / `NEXT_PUBLIC_REPLACEMENTS_WRITE_SECRET`-ով (POC-level, ոչ RBAC).

---

## 8. Env փոփոխականներ (ամփոփ)

```env
NEXT_PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
NEXT_PUBLIC_MAPTILES_URL=
NEXT_PUBLIC_MAP_CENTER_LNG=…
NEXT_PUBLIC_MAP_CENTER_LAT=…
NEXT_PUBLIC_MAP_INITIAL_ZOOM=…
NEXT_PUBLIC_MAP_INITIAL_PITCH=…
NEXT_PUBLIC_MAP_INITIAL_BEARING=…
NEXT_PUBLIC_TERRAIN_TILEJSON_URL=   # optional
NEXT_PUBLIC_OVERPASS_URL=           # optional
NEXT_PUBLIC_MAX_GLB_BYTES=26214400
REPLACEMENTS_WRITE_SECRET=…
NEXT_PUBLIC_REPLACEMENTS_WRITE_SECRET=…
DATABASE_URL=…
DIRECT_URL=…
```

---

## 9. Known limitations (աղբյուրից)

- Vector feature id-ները կարող են անկայուն լինել zoom / tileset rebuild-ի ժամանակ.
- Geometry hash-ը **չի կարող** օգտագործվել MapLibre style filter-ում → հաճախ extrusion-ը մնում է GLB-ի տակ (UI warning).
- OpenFreeMap-ի նման public styles-ում `osm_id` հաճախ բացակայում է.
- Production-grade hide-ի համար պետք է ETL-time stable id (`osm_id` / `custom_model_id`) կամ custom tileset.
- `blob:` model URL-ները session-ից հետո չեն մնում — պետք է hosted URL (R2 և այլն).
- Հարյուրավոր ծանր unique GLB-ների համար պետք է LOD / instancing / 3D Tiles.
- Terrain draping-ը best-effort է.

---

## 10. Համեմատություն ToonExpo-ի հետ

| Կետ                      | Map POC                               | ToonExpo (ներկա)                                                                 |
| ------------------------ | ------------------------------------- | -------------------------------------------------------------------------------- |
| Frontend                 | Standalone Next.js                    | `apps/web` (Next 16.2 + React 19)                                                |
| Backend                  | Next.js `app/api/**` + Prisma in Next | **Միայն** `apps/api` NestJS + `packages/db` Prisma                               |
| Maps (product)           | Geo MapLibre 3D city                  | Interactive mapping = **2D image hotspots** (canvas), exhibition map = **Konva** |
| Media                    | Local / API models / data URLs        | Cloudflare **R2**                                                                |
| Auth                     | Shared write secret                   | NestJS Auth + RBAC                                                               |
| MapLibre / Three         | Կա                                    | **Դեռ չկա** `apps/web` dependencies-ում                                          |
| TECH_CARD exhibition map | —                                     | Konva 10.x confirmed                                                             |
| Visual Map / Hotspots    | —                                     | Rendered images + polygons/points (ոչ OSM city map)                              |

### Architecture hard rule (ինտեգրման ժամանակ)

ToonExpo-ում **չի կարելի** պորտ անել Map repo-ի Next.js Route Handlers-ը որպես product API, և **չի կարելի** Prisma օգտագործել `apps/web`-ից։

Ճիշտ սահման.

```text
Browser (MapLibre + Three UI in apps/web)
  → NestJS REST (apps/api) — replacements, GLB upload auth, RBAC
  → Prisma (packages/db) → Neon
  → R2 — GLB binaries
```

Տես՝ `docs/architecture/FRONTEND_BACKEND_BOUNDARY.md`.

Նշում `docs/TOONEXPO-INTEGRATION.md`-ից. Defense-ի **3D GLB floor mapper** (`Building3dMapper`) նշված է որպես **SKIP** — դա այլ use-case է (հարկերի mesh picker), ոչ այս city MapLibre POC-ը։ Այս Map repo-ն առանձին որոշում է պահանջում։

---

## 11. Ինտեգրման առաջարկ (միայն ուղղություն — դեռ չիրականացնել առանց հաստատման)

### Ինչ արժե վերցնել (port / adapt)

1. **Client map stack**՝ `maplibre-gl` + `three` + custom layer pattern (`CustomBuildingLayer`, identity, filter, mercator transform).
2. **Types / pure libs**՝ `BuildingIdentity`, filter merge, GLB load/dispose, centroid math.
3. **UX flow**՝ select building → apply GLB → transform → restore.
4. Optional later՝ vegetation / vehicles (performance և product scope-ից կախված).

### Ինչ չպետք է copy-paste անել

1. Next.js `app/api/**` + Prisma-in-Next persistence.
2. `localStorage`-ը որպես production source of truth.
3. Shared write-secret auth մոդելը.
4. POC UI / Tailwind tokens որպես product design.
5. Ամբողջ repo-ն որպես submodule առանց սահմանների — պետք է feature module ToonExpo layout-ով.

### Հավանական product տեղադրում (քննարկման համար)

| Տարբերակ                         | Նկարագրություն                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| A. Admin / Builder «City 3D» lab | Նոր feature՝ geo քարտեզում custom building models (առանձին `interactive-mapping` 2D-ից) |
| B. Public project showcase       | Buyer-facing 3D neighborhood view՝ builder-ի GLB-ներով                                  |
| C. Միայն R&D sandbox             | `apps/web` lab route, առանց production persistence                                      |

Խոշոր որոշումներ (պահանջում են հաստատում).

- Ավելացնել `maplibre-gl` + `three` `apps/web`-ում (TECH_CARD / architecture update).
- Նոր Prisma մոդելներ `packages/db`-ում (replacement + media link).
- NestJS endpoints + R2 GLB upload.
- Tiles strategy՝ public OpenFreeMap vs self-hosted OMT extract `osm_id`-ով.

---

## 12. Առաջարկվող իրականացման փուլեր (հաստատումից հետո)

1. **Spike (apps/web only)** — MapLibre + մի GLB custom layer lab page, առանց Nest persistence.
2. **Contracts + API** — replacement DTO, Nest CRUD, R2 upload, authz (admin/builder).
3. **Editor UX** — select / hide / transform / restore՝ կապված API-ին.
4. **Tiles identity** — որոշել stable building id strategy (ETL կամ custom property).
5. **Polish (optional)** — vegetation, traffic, share camera URL — միայն եթե product scope-ում է.

---

## 13. Աղբյուրի օգտակար ֆայլեր

| Ֆայլ                                        | Ինչու                     |
| ------------------------------------------- | ------------------------- |
| `README.md`                                 | Quick start, env, usage   |
| `docs/architecture.md`                      | Layer responsibilities    |
| `docs/custom-3d-layer.md`                   | Mercator + Three matrix   |
| `docs/building-identification.md`           | ID priority / instability |
| `docs/known-limitations.md`                 | Production blockers       |
| `docs/3d-tree-architecture.md`              | Vegetation pipeline       |
| `src/components/map/MapView.tsx`            | Map lifecycle wiring      |
| `src/components/map/CustomBuildingLayer.ts` | Core 3D integration       |
| `src/types/building.ts`                     | Domain types              |

---

## 14. Եզրակացություն

Map repo-ն հասուն **MapLibre + Three.js GLB replacement POC** է՝ selection, hide-filter, transforms, client/server persistence և լրացուցիչ city atmosphere (trees, cars)։

ToonExpo-ում ինտեգրումը **հնարավոր է**, բայց ոչ որպես ամբողջ Next monolith-ի տեղափոխում. Պետք է.

- UI/WebGL մասը՝ `apps/web` feature.
- Persistence / upload / auth՝ `apps/api` + `packages/db` + R2.
- Առանձնացնել այս geo-3D use-case-ը ներկա 2D interactive-mapping / Konva exhibition map-ից.
- Նախ հաստատել product scope (lab vs admin vs public) և tiles identity strategy.

**Հաջորդ քայլ.** հաստատել ինտեգրման տարբերակը և spike-ի սահմանը՝ հետո միայն սկսել կոդային աշխատանք։

**Ինտեգրման պլան (ընտրված ուղղություն՝ թեթև City 3D Map):** [`CITY_3D_MAP_INTEGRATION_PLAN.md`](./CITY_3D_MAP_INTEGRATION_PLAN.md)
