import type { GeoMapObject } from '@/features/geo-map/types';

/**
 * Live pose override for one map object (admin transform preview and/or drag).
 * Only provided fields are applied; omit a field to keep the base object value.
 */
export type ObjectTransformOverride = {
  id: string;
  longitude?: number;
  latitude?: number;
  altitudeM?: number;
  headingDeg?: number;
  pitchDeg?: number;
  rollDeg?: number;
  scale?: number;
  minZoom?: number;
};

/**
 * Drag-move override — longitude/latitude are always set while dragging.
 * Prefer {@link ObjectTransformOverride} for full pose previews.
 */
export type ObjectPositionOverride = ObjectTransformOverride & {
  longitude: number;
  latitude: number;
};

const pickDefinedTransform = (
  object: GeoMapObject,
  override: ObjectTransformOverride,
): GeoMapObject => ({
  ...object,
  ...(override.longitude !== undefined ? { longitude: override.longitude } : {}),
  ...(override.latitude !== undefined ? { latitude: override.latitude } : {}),
  ...(override.altitudeM !== undefined ? { altitudeM: override.altitudeM } : {}),
  ...(override.headingDeg !== undefined ? { headingDeg: override.headingDeg } : {}),
  ...(override.pitchDeg !== undefined ? { pitchDeg: override.pitchDeg } : {}),
  ...(override.rollDeg !== undefined ? { rollDeg: override.rollDeg } : {}),
  ...(override.scale !== undefined ? { scale: override.scale } : {}),
  ...(override.minZoom !== undefined ? { minZoom: override.minZoom } : {}),
});

/**
 * Returns `objects` with the matching object's transform fields replaced by any
 * defined fields on `override`. Used for admin live slider preview and drag.
 */
export const applyTransformOverride = (
  objects: GeoMapObject[],
  override: ObjectTransformOverride | null,
): GeoMapObject[] => {
  if (!override) {
    return objects;
  }

  return objects.map((object) =>
    object.id === override.id ? pickDefinedTransform(object, override) : object,
  );
};

/** @deprecated Prefer {@link applyTransformOverride}. */
export const applyPositionOverride = applyTransformOverride;
