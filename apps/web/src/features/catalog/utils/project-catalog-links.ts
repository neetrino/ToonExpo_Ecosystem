/** Marketing / media URLs stored under `amenities.links`. */

export type ProjectCatalogLinkId =
  | 'exteriorRenders'
  | 'interiorRenders'
  | 'typicalInteractiveTour'
  | 'video'
  | 'exteriorInteractiveTour'
  | 'matterport'
  | 'external3d'
  | 'floorplans2d'
  | 'floorplans3d'
  | 'branding'
  | 'map'
  | 'website'
  | 'facebook'
  | 'instagram';

export type ProjectCatalogLink = {
  id: ProjectCatalogLinkId;
  url: string;
};

const isHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const PROJECT_CATALOG_LINK_IDS: readonly ProjectCatalogLinkId[] = [
  'exteriorRenders',
  'interiorRenders',
  'typicalInteractiveTour',
  'video',
  'exteriorInteractiveTour',
  'matterport',
  'external3d',
  'floorplans2d',
  'floorplans3d',
  'branding',
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
  matterport: ProjectCatalogLink | null;
  external3d: ProjectCatalogLink | null;
  map: ProjectCatalogLink | null;
} => {
  const media: ProjectCatalogLink[] = [];
  const social: ProjectCatalogLink[] = [];
  let video: ProjectCatalogLink | null = null;
  let typicalTour: ProjectCatalogLink | null = null;
  let exteriorTour: ProjectCatalogLink | null = null;
  let matterport: ProjectCatalogLink | null = null;
  let external3d: ProjectCatalogLink | null = null;
  let map: ProjectCatalogLink | null = null;
  for (const link of links) {
    if (link.id === 'video') {
      video = link;
    } else if (link.id === 'typicalInteractiveTour') {
      typicalTour = link;
    } else if (link.id === 'exteriorInteractiveTour') {
      exteriorTour = link;
    } else if (link.id === 'matterport') {
      matterport = link;
    } else if (link.id === 'external3d') {
      external3d = link;
    } else if (link.id === 'map') {
      map = link;
    } else if (isProjectCatalogSocialLink(link.id)) {
      social.push(link);
    } else {
      media.push(link);
    }
  }
  return { media, social, video, typicalTour, exteriorTour, matterport, external3d, map };
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

/**
 * Parses one catalog link field that may contain multiple image URLs
 * (comma/newline/semicolon-separated) into gallery-ready image sources.
 */
export const parseCatalogImageUrls = (value: string): string[] => {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  const candidates = trimmed
    .split(/[\n,;]+/u)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const urls = candidates.length > 0 ? candidates : [trimmed];
  const unique = new Set<string>();
  for (const url of urls) {
    if (isHttpUrl(url)) {
      unique.add(url);
    }
  }
  return Array.from(unique);
};

/** Parses `amenities.gallery` into a unique list of HTTP(S) image candidates. */
export const parseCatalogGalleryUrls = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    const unique = new Set<string>();
    for (const item of value) {
      if (typeof item !== 'string') {
        continue;
      }
      for (const url of parseCatalogImageUrls(item)) {
        unique.add(url);
      }
    }
    return Array.from(unique);
  }

  if (typeof value === 'string') {
    return parseCatalogImageUrls(value);
  }

  return [];
};
