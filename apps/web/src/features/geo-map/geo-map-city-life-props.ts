import type { GeoMapCanvasProps } from '@/features/geo-map/types';

/**
 * Shared city polish for every `GeoMapCanvas` — admin is the source of truth,
 * public home / `/map` / project maps reuse the same trees + traffic layers.
 */
export const GEO_MAP_CITY_LIFE_PROPS = {
  greenCanopyEnabled: true,
  roadTrafficEnabled: true,
} as const satisfies Pick<GeoMapCanvasProps, 'greenCanopyEnabled' | 'roadTrafficEnabled'>;
