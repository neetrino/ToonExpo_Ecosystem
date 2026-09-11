import type { GreenLngLat, GreenSampleBounds } from '@/features/geo-map/trees/types';

export const isLngLatInBounds = (point: GreenLngLat, clip: GreenSampleBounds): boolean =>
  point.longitude >= clip.west &&
  point.longitude <= clip.east &&
  point.latitude >= clip.south &&
  point.latitude <= clip.north;
