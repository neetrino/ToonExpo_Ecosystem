import type { GeoMapObject } from '@/features/geo-map/types';

/**
 * Resolves the published geo-map object for a project id.
 */
export const resolveMapObjectForProject = <T extends Pick<GeoMapObject, 'id' | 'projectId'>>(
  objects: readonly T[],
  projectId: string,
): T | null => {
  const match = objects.find((object) => object.projectId === projectId);
  return match ?? null;
};

/** Project ids that currently have a published map model. */
export const collectMappableProjectIds = (
  objects: readonly Pick<GeoMapObject, 'projectId'>[],
): ReadonlySet<string> => {
  const ids = new Set<string>();
  for (const object of objects) {
    if (object.projectId) {
      ids.add(object.projectId);
    }
  }
  return ids;
};
