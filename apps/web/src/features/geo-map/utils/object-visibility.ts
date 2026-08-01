import {
  MARKER_BOUNDS_PADDING_DEGREES,
  MODEL_BOUNDS_PADDING_DEGREES,
} from '@/features/geo-map/constants';
import { isCoordinateWithinBounds, type LngLatBounds } from '@/features/geo-map/utils/geo-bounds';
import type { GeoMapObject } from '@/features/geo-map/types';

export type ObjectVisibilitySplit = {
  /**
   * Compact discoverability dots — kept whenever the object is near the
   * viewport, including after the 3D model appears.
   */
  markerObjects: GeoMapObject[];
  /** Objects to render as a GLB model — zoom at/above `minZoom` and within the (padded) viewport. */
  modelObjects: GeoMapObject[];
};

/** Whether the current zoom has reached the object's model threshold. */
export const hasReachedModelZoom = (zoom: number, minZoom: number): boolean => zoom >= minZoom;

const isWithinPaddedBounds = (
  object: GeoMapObject,
  bounds: LngLatBounds | null,
  paddingDegrees: number,
): boolean =>
  bounds === null ||
  isCoordinateWithinBounds(object.longitude, object.latitude, bounds, paddingDegrees);

/**
 * Splits `objects` into markers vs. models for the current camera state.
 *
 * - Dots (markers): always when near the viewport (generous margin) so every
 *   placed project stays discoverable at low zoom and while GLBs are shown.
 * - Models: at/above `minZoom` and inside a tight viewport margin so concurrent
 *   GLB loads stay capped.
 *
 * `bounds === null` (e.g. map not ready yet) skips the viewport check so nothing
 * is hidden purely because the camera state hasn't loaded.
 */
export const splitObjectsByVisibility = (
  objects: GeoMapObject[],
  zoom: number,
  bounds: LngLatBounds | null,
): ObjectVisibilitySplit => {
  const markerObjects: GeoMapObject[] = [];
  const modelObjects: GeoMapObject[] = [];

  for (const object of objects) {
    if (isWithinPaddedBounds(object, bounds, MARKER_BOUNDS_PADDING_DEGREES)) {
      markerObjects.push(object);
    }

    if (
      hasReachedModelZoom(zoom, object.minZoom) &&
      isWithinPaddedBounds(object, bounds, MODEL_BOUNDS_PADDING_DEGREES)
    ) {
      modelObjects.push(object);
    }
  }

  return { markerObjects, modelObjects };
};
