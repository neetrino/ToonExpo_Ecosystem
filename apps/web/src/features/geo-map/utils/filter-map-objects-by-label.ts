import type { GeoMapObject } from '@/features/geo-map/types';

const normalize = (value: string): string => value.trim().toLocaleLowerCase();

/**
 * Client-side filter of map objects by project label (case-insensitive substring).
 * Empty / whitespace-only query returns all objects.
 */
export const filterMapObjectsByLabel = (
  objects: readonly GeoMapObject[],
  query: string,
): GeoMapObject[] => {
  const needle = normalize(query);
  if (needle.length === 0) {
    return [...objects];
  }
  return objects.filter((object) => normalize(object.label).includes(needle));
};
