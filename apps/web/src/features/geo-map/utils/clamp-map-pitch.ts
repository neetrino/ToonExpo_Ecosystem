import { MAX_MAP_PITCH_DEG } from '@/features/geo-map/constants';

const MIN_MAP_PITCH_DEG = 0;

/**
 * Clamps a camera pitch into the MapLibre-safe range used by GeoMapCanvas.
 */
export const clampMapPitch = (pitchDeg: number): number =>
  Math.min(MAX_MAP_PITCH_DEG, Math.max(MIN_MAP_PITCH_DEG, pitchDeg));
