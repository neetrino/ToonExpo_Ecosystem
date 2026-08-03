import { FOCUS_ZOOM_ABOVE_MIN, MAX_MAP_ZOOM, MIN_MAP_ZOOM } from '@/features/geo-map/constants';
import type { GeoMapLngLat, GeoMapObject } from '@/features/geo-map/types';

export type FocusCameraTarget = {
  center: GeoMapLngLat;
  zoom: number;
};

const clampZoom = (zoom: number): number => Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, zoom));

/**
 * Resolves MapLibre flyTo camera params for a focus request.
 * Default zoom sits slightly above the object's `minZoom` so the GLB is visible.
 */
export const resolveFocusCamera = (
  object: Pick<GeoMapObject, 'longitude' | 'latitude' | 'minZoom'>,
  zoomOverride?: number,
): FocusCameraTarget => {
  const zoom = zoomOverride === undefined ? object.minZoom + FOCUS_ZOOM_ABOVE_MIN : zoomOverride;

  return {
    center: { longitude: object.longitude, latitude: object.latitude },
    zoom: clampZoom(zoom),
  };
};

/**
 * Finds the object for a focus request. Returns `null` when the id is unknown.
 */
export const findFocusObject = (
  objects: readonly GeoMapObject[],
  objectId: string,
): GeoMapObject | null => objects.find((object) => object.id === objectId) ?? null;
