/**
 * Visual map module constants.
 */

/** Minimum hotspot coordinate percent (inclusive). */
export const VISUAL_MAP_COORD_MIN = 0;

/** Maximum hotspot coordinate percent (inclusive). */
export const VISUAL_MAP_COORD_MAX = 100;

/**
 * Primary expected hotspot target type for each canvas context layer.
 * Project canvases also allow legacy `building` targets (see target-type.ts).
 */
export const CONTEXT_TARGET_TYPE = {
  project: 'district',
  district: 'building',
  building: 'floor',
  floor: 'apartment',
} as const;

/** Allowed target types per context (project keeps building for backward compat). */
export const CONTEXT_ALLOWED_TARGET_TYPES = {
  project: ['district', 'building'],
  district: ['building'],
  building: ['floor'],
  floor: ['apartment'],
} as const;

/** Publication status returned on public visual map endpoints. */
export const PUBLIC_VISUAL_MAP_STATUS = 'published' as const;
