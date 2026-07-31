import {
  MARKER_BOUNDS_PADDING_DEGREES,
  MODEL_BOUNDS_PADDING_DEGREES,
} from '@/features/geo-map/constants';
import { isCoordinateWithinBounds, type LngLatBounds } from '@/features/geo-map/utils/geo-bounds';
import type { GeoMapObject } from '@/features/geo-map/types';

export type ObjectVisibilitySplit = {
  /** Objects to render as a marker (label) — zoom below the object's `minZoom`. */
  markerObjects: GeoMapObject[];
  /** Objects to render as a GLB model — zoom at/above `minZoom` and within the (padded) viewport. */
  modelObjects: GeoMapObject[];
};

/** Whether the current zoom has reached the object's model threshold. */
export const hasReachedModelZoom = (zoom: number, minZoom: number): boolean => zoom >= minZoom;

/**
 * Splits `objects` into markers vs. models for the current camera state.
 *
 * - Below `minZoom`: shown as a marker (viewport-filtered with a generous margin;
 *   markers are cheap DOM nodes).
 * - At/above `minZoom`: shown as a GLB model, but only when inside the viewport
 *   (tight margin) — this is what keeps concurrent GLB loads to a few dozen at most.
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
    const showAsModel = hasReachedModelZoom(zoom, object.minZoom);
    const padding = showAsModel ? MODEL_BOUNDS_PADDING_DEGREES : MARKER_BOUNDS_PADDING_DEGREES;
    const isInBounds =
      bounds === null ||
      isCoordinateWithinBounds(object.longitude, object.latitude, bounds, padding);

    if (!isInBounds) {
      continue;
    }

    if (showAsModel) {
      modelObjects.push(object);
    } else {
      markerObjects.push(object);
    }
  }

  return { markerObjects, modelObjects };
};
