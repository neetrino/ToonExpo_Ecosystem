/**
 * Visual map module constants.
 */

/** Minimum hotspot coordinate percent (inclusive). */
export const VISUAL_MAP_COORD_MIN = 0;

/** Maximum hotspot coordinate percent (inclusive). */
export const VISUAL_MAP_COORD_MAX = 100;

/** Expected hotspot target type for each canvas context layer. */
export const CONTEXT_TARGET_TYPE = {
  project: "building",
  building: "floor",
  floor: "apartment",
} as const;

/** Publication status returned on public visual map endpoints. */
export const PUBLIC_VISUAL_MAP_STATUS = "published" as const;
