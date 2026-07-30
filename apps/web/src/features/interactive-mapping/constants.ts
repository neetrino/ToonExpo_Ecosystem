/** Interactive mapping Admin / Builder feature constants. */

export const INTERACTIVE_MAPPING_ADMIN_BASE_PATH = '/admin/interactive-mapping' as const;
export const INTERACTIVE_MAPPING_BUILDER_BASE_PATH = '/builder/interactive-mapping' as const;

/** @deprecated Use INTERACTIVE_MAPPING_ADMIN_BASE_PATH or scope.basePath */
export const INTERACTIVE_MAPPING_BASE_PATH = INTERACTIVE_MAPPING_ADMIN_BASE_PATH;

export const INTERACTIVE_MAPPING_ADMIN_API_PREFIX = '/admin/interactive-mapping' as const;
export const INTERACTIVE_MAPPING_PORTAL_API_PREFIX = '/portal/interactive-mapping' as const;

export const INTERACTIVE_MAPPING_PROJECTS_QUERY_KEY = ['interactive-mapping', 'projects'] as const;

export const interactiveMappingProjectQueryKey = (projectId: string, mode: 'admin' | 'portal') =>
  [...INTERACTIVE_MAPPING_PROJECTS_QUERY_KEY, mode, projectId] as const;

export const interactiveMappingProjectsQueryKey = (mode: 'admin' | 'portal') =>
  [...INTERACTIVE_MAPPING_PROJECTS_QUERY_KEY, mode] as const;

export const MIN_FLOOR_COUNT = 1;
export const MAX_FLOOR_COUNT = 60;

/** Marker coordinates from MappingCanvas are normalized 0–1; Nest stores 0–100. */
export const MARKER_TO_PERCENT = 100;

export const PHASE_TITLE_KEYS = {
  1: 'phases.districts',
  2: 'phases.buildings',
  3: 'phases.floors',
  4: 'phases.apartments',
} as const;
