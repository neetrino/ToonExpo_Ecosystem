/**
 * Brand-aligned MapLibre paint overrides for OpenFreeMap liberty.
 * Colors mirror `apps/web/src/app/[locale]/theme.css` (@theme tokens).
 */

/** Canvas / land — `--color-canvas` / `--color-background`. */
export const BRAND_MAP_BACKGROUND = '#f7f6f3';
export const BRAND_MAP_LANDUSE_RESIDENTIAL = '#efeee9';

/** Water — cool tint from `--color-brand-soft` / `--color-band-mist`. */
export const BRAND_MAP_WATER_FILL = '#c5dde6';
export const BRAND_MAP_WATERWAY = '#9dbecb';

/** Parks / greenery — muted, cool (avoid neon OSM greens). */
export const BRAND_MAP_PARK = '#d4e3d6';
export const BRAND_MAP_WOOD = '#c5d6c8';
export const BRAND_MAP_GRASS = '#dbe8dc';

/** Roads — warm neutrals instead of liberty yellow. */
export const BRAND_MAP_ROAD_CASING = '#d9d4cb';
export const BRAND_MAP_ROAD_MINOR = '#ffffff';
export const BRAND_MAP_ROAD_MAJOR = '#f3f0ea';
export const BRAND_MAP_ROAD_MOTORWAY = '#e7e0d4';

/** Labels — `--color-ink-secondary` / `--color-ink-muted`. */
export const BRAND_MAP_LABEL_TEXT = '#555c68';
export const BRAND_MAP_LABEL_HALO = '#f7f6f3';

/** OSM 3D extrusions — muted gray so GLB models read as the hero. */
export const BRAND_MAP_BUILDING_EXTRUSION_TOP = '#d0d4d9';
export const BRAND_MAP_BUILDING_EXTRUSION_OPACITY = 0.72;
export const BRAND_MAP_BUILDING_FILL = '#dde1e6';
export const BRAND_MAP_BUILDING_FILL_OPACITY = 0.55;
