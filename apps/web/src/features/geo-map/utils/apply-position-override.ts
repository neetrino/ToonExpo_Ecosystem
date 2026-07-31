import type { GeoMapObject } from '@/features/geo-map/types';

export type ObjectPositionOverride = {
  id: string;
  longitude: number;
  latitude: number;
};

/**
 * Returns `objects` with the matching object's position replaced by `override`.
 * Used to show live drag feedback before the parent (controlled) `objects` prop
 * catches up via `onObjectDragged`.
 */
export const applyPositionOverride = (
  objects: GeoMapObject[],
  override: ObjectPositionOverride | null,
): GeoMapObject[] => {
  if (!override) {
    return objects;
  }

  return objects.map((object) =>
    object.id === override.id
      ? { ...object, longitude: override.longitude, latitude: override.latitude }
      : object,
  );
};
