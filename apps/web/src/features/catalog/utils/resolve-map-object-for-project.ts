import type { GeoMapObject } from '@/features/geo-map/types';

/**
 * Resolves the published geo-map object for a project id.
 * Public payloads use `projectId` as the object id (one model per project).
 */
export const resolveMapObjectForProject = (
  objects: readonly Pick<GeoMapObject, 'id' | 'projectId'>[],
  projectId: string,
): Pick<GeoMapObject, 'id' | 'projectId'> | null => {
  const match = objects.find((object) => object.projectId === projectId);
  return match ?? null;
};

/** Project ids that currently have a published map model. */
export const collectMappableProjectIds = (
  objects: readonly Pick<GeoMapObject, 'projectId'>[],
): ReadonlySet<string> => new Set(objects.map((object) => object.projectId));
