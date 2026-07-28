/** Marketing / media URLs stored under `amenities.links`. */

export type ProjectCatalogLinkId =
  | 'exteriorRenders'
  | 'interiorRenders'
  | 'typicalInteractiveTour'
  | 'video'
  | 'exteriorInteractiveTour'
  | 'map'
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
  'map',
  'website',
  'facebook',
  'instagram',
] as const;

/** Website + social profiles — rendered in a separate Socials card. */
export const PROJECT_CATALOG_SOCIAL_LINK_IDS = ['website', 'facebook', 'instagram'] as const;

export type ProjectCatalogSocialLinkId = (typeof PROJECT_CATALOG_SOCIAL_LINK_IDS)[number];

export const isProjectCatalogSocialLink = (
  id: ProjectCatalogLinkId,
): id is ProjectCatalogSocialLinkId => {
  return (PROJECT_CATALOG_SOCIAL_LINK_IDS as readonly string[]).includes(id);
};

export const splitProjectCatalogLinks = (
  links: readonly ProjectCatalogLink[],
): {
  media: ProjectCatalogLink[];
  social: ProjectCatalogLink[];
  video: ProjectCatalogLink | null;
  typicalTour: ProjectCatalogLink | null;
  exteriorTour: ProjectCatalogLink | null;
  map: ProjectCatalogLink | null;
} => {
  const media: ProjectCatalogLink[] = [];
  const social: ProjectCatalogLink[] = [];
  let video: ProjectCatalogLink | null = null;
  let typicalTour: ProjectCatalogLink | null = null;
  let exteriorTour: ProjectCatalogLink | null = null;
  let map: ProjectCatalogLink | null = null;
  for (const link of links) {
    if (link.id === 'video') {
      video = link;
    } else if (link.id === 'typicalInteractiveTour') {
      typicalTour = link;
    } else if (link.id === 'exteriorInteractiveTour') {
      exteriorTour = link;
    } else if (link.id === 'map') {
      map = link;
    } else if (isProjectCatalogSocialLink(link.id)) {
      social.push(link);
    } else {
      media.push(link);
    }
  }
  return { media, social, video, typicalTour, exteriorTour, map };
};

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
