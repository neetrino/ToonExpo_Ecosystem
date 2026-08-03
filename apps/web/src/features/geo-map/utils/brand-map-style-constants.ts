/**
 * Brand-aligned MapLibre paint overrides for OpenFreeMap liberty.
 * Colors mirror `apps/web/src/app/[locale]/theme.css` (@theme tokens).
 */

/** Canvas / land — `--color-canvas` / `--color-background`. */
export const BRAND_MAP_BACKGROUND = '#f7f6f3';
export const BRAND_MAP_LANDUSE_RESIDENTIAL = '#efeee9';

/** Water — cooler, richer blues (still brand-soft, not saturated OSM cyan). */
export const BRAND_MAP_WATER_FILL = '#a8c4d4';
export const BRAND_MAP_WATERWAY = '#8eb0c2';

/** Parks / greenery — richer muted greens without neon OSM look. */
export const BRAND_MAP_PARK = '#b9d0bc';
export const BRAND_MAP_WOOD = '#a8c0ac';
export const BRAND_MAP_GRASS = '#c5d9c8';

/** Roads — warm neutrals instead of liberty yellow. */
export const BRAND_MAP_ROAD_CASING = '#d9d4cb';
export const BRAND_MAP_ROAD_MINOR = '#ffffff';
export const BRAND_MAP_ROAD_MAJOR = '#f3f0ea';
export const BRAND_MAP_ROAD_MOTORWAY = '#e7e0d4';

/** Labels — `--color-ink-secondary` / `--color-ink-muted`. */
export const BRAND_MAP_LABEL_TEXT = '#555c68';
export const BRAND_MAP_LABEL_HALO = '#f7f6f3';

/**
 * OSM 3D extrusion base tint — warm stone so height-interpolated roofs read
 * less "clay"; GLB models still remain the hero (opacity kept below 1).
 */
export const BRAND_MAP_BUILDING_EXTRUSION_TOP = '#e0d8cc';
export const BRAND_MAP_BUILDING_EXTRUSION_OPACITY = 0.92;
export const BRAND_MAP_BUILDING_FILL = '#dde1e6';
export const BRAND_MAP_BUILDING_FILL_OPACITY = 0.55;
