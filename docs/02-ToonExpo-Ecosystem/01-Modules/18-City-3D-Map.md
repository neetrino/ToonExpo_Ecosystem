# City 3D Map (homepage MAP VIEW)

Platform-admin GLB placements on a MapLibre basemap, linked to catalog `Building` records and shown on the public homepage MAP VIEW.

## Docs

- Plan: [`docs/research/CITY_3D_MAP_INTEGRATION_PLAN.md`](../../../docs/research/CITY_3D_MAP_INTEGRATION_PLAN.md)
- Progress: [`docs/research/CITY_3D_MAP_PROGRESS.md`](../../../docs/research/CITY_3D_MAP_PROGRESS.md)
- Research: [`docs/research/MAP_REPO_STUDY.md`](../../../docs/research/MAP_REPO_STUDY.md)

## Blender export

- Units: Metric, unit scale 1
- Origin at building footprint center, ground level
- Export `.glb`
- Default map rotation X = 90°

## Limits

- Max GLB size: 25 MB (`CITY_MAP_MAX_GLB_BYTES`)
- Max placements: 200
- Mobile GPUs may struggle with many heavy models — keep models optimized
