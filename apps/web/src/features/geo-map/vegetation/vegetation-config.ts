import type {
  TreeSpeciesId,
  VegetationConfig,
  VegetationQualityId,
  VegetationQualityPreset,
} from '@/features/geo-map/vegetation/types';

export const VEGETATION_LAYER_ID = 'geo-map-vegetation';

/** Trees hidden below this zoom (flat basemap only). */
export const VEGETATION_MIN_ZOOM = 16;

/** Minimum pitch (deg) before 3D trees appear. */
export const VEGETATION_MIN_PITCH_DEG = 28;

/** Debounce for park rediscovery on move/idle (ms). */
export const VEGETATION_DISCOVER_DEBOUNCE_MS = 450;

/** Max green polygons processed per viewport refresh. */
export const VEGETATION_MAX_VIEWPORT_PARKS = 6;

export const VEGETATION_FEATURE_TYPES = [
  'park',
  'garden',
  'grass',
  'recreation_ground',
  'wood',
  'forest',
  'cemetery',
] as const;

export const TREE_SPECIES_ASSETS: Record<
  TreeSpeciesId,
  { textureUrl: string; targetHeightM: number; targetWidthM: number }
> = {
  deciduous: {
    textureUrl: '/textures/vegetation/tree-deciduous.webp',
    targetHeightM: 11,
    targetWidthM: 8.5,
  },
  compact: {
    textureUrl: '/textures/vegetation/tree-compact.webp',
    targetHeightM: 7,
    targetWidthM: 6.5,
  },
  conifer: {
    textureUrl: '/textures/vegetation/tree-conifer.webp',
    targetHeightM: 13,
    targetWidthM: 7,
  },
};

/** Production defaults — stricter than the Map POC for main-thread budget. */
export const DEFAULT_VEGETATION_CONFIG: VegetationConfig = {
  enabled: true,
  minZoom: VEGETATION_MIN_ZOOM,
  maxZoom: 22,
  minSpacingMeters: 4.2,
  edgePaddingMeters: 0.6,
  maxTreesPerFeature: 120,
  minTreesPerFeature: 6,
  seed: 'toonexpo-vegetation-v1',
  configVersion: '1',
  groundOffsetMeters: 0.05,
  buildingBufferMeters: 0.5,
  roadBufferMeters: 0,
  speciesWeights: {
    deciduous: 0.55,
    compact: 0.35,
    conifer: 0.1,
  },
};

export const VEGETATION_QUALITY: Record<VegetationQualityId, VegetationQualityPreset> = {
  low: { densityMultiplier: 0.65, maxInstances: 280 },
  medium: { densityMultiplier: 0.85, maxInstances: 450 },
};

export const pickVegetationQuality = (): VegetationQualityId => {
  if (typeof window === 'undefined') {
    return 'low';
  }
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (width < 900 || dpr >= 2 || cores <= 8) {
    return 'low';
  }
  return 'medium';
};
