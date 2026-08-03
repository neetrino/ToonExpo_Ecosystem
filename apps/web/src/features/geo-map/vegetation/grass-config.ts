import type { VegetationQualityId } from '@/features/geo-map/vegetation/types';

export type GrassConfig = {
  enabled: boolean;
  minZoom: number;
  minSpacingMeters: number;
  edgePaddingMeters: number;
  maxBladesPerFeature: number;
  minBladesPerFeature: number;
  seed: string;
  configVersion: string;
  bladeHeightMinM: number;
  bladeHeightMaxM: number;
  bladeWidthM: number;
  groundOffsetMeters: number;
};

export type GrassQualityPreset = {
  densityMultiplier: number;
  maxInstances: number;
};

/** Grass appears closer than trees; capped hard for GPU budget. */
export const DEFAULT_GRASS_CONFIG: GrassConfig = {
  enabled: true,
  minZoom: 17.5,
  minSpacingMeters: 3.6,
  edgePaddingMeters: 0.6,
  maxBladesPerFeature: 100,
  minBladesPerFeature: 4,
  seed: 'toonexpo-grass-v1',
  configVersion: '1',
  bladeHeightMinM: 0.4,
  bladeHeightMaxM: 0.75,
  bladeWidthM: 0.7,
  groundOffsetMeters: 0.02,
};

export const GRASS_MIN_PITCH_DEG = 35;

export const GRASS_TEXTURE_URL = '/textures/vegetation/grass-tuft.webp';

export const GRASS_QUALITY: Record<VegetationQualityId, GrassQualityPreset> = {
  low: { densityMultiplier: 0.5, maxInstances: 180 },
  medium: { densityMultiplier: 0.7, maxInstances: 280 },
};
