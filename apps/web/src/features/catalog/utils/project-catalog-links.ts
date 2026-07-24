/** Marketing / media URLs stored under `amenities.links`. */

export type ProjectCatalogLinkId =
  | 'exteriorRenders'
  | 'interiorRenders'
  | 'typicalInteractiveTour'
  | 'video'
  | 'exteriorInteractiveTour'
  | 'floorPlans2d'
  | 'floorPlans3d'
  | 'logoBranding'
  | 'website'
  | 'facebook'
  | 'instagram';

export type ProjectCatalogLink = {
  id: ProjectCatalogLinkId;
  url: string;
};

export const PROJECT_CATALOG_LINK_IDS: readonly ProjectCatalogLinkId[] = [
  'exteriorRenders',
  'interiorRenders',
  'typicalInteractiveTour',
  'video',
  'exteriorInteractiveTour',
  'floorPlans2d',
  'floorPlans3d',
  'logoBranding',
  'website',
  'facebook',
  'instagram',
] as const;

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Parses `amenities.links` into ordered catalog link rows.
 */
export const parseProjectCatalogLinks = (value: unknown): ProjectCatalogLink[] => {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return [];
  }

  const record = value as Record<string, unknown>;
  const links: ProjectCatalogLink[] = [];
  for (const id of PROJECT_CATALOG_LINK_IDS) {
    const url = asNonEmptyString(record[id]);
    if (url != null) {
      links.push({ id, url });
    }
  }
  return links;
};
