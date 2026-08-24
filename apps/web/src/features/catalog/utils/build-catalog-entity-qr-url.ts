import { resolveSiteUrl } from '@/shared/config/site-url';

/** Path segment for project/apartment QR interest landing pages. */
export const CATALOG_QR_INTEREST_PATH_SEGMENT = 'interest';

/**
 * Absolute project interest URL encoded in project QR printouts / detail pages.
 */
export const buildProjectCatalogQrUrl = (locale: string, projectSlug: string): string => {
  const base = resolveSiteUrl();
  return `${base}/${locale}/projects/${encodeURIComponent(projectSlug)}/${CATALOG_QR_INTEREST_PATH_SEGMENT}`;
};

/**
 * Absolute apartment interest URL for apartment detail QR.
 */
export const buildApartmentCatalogQrUrl = (locale: string, apartmentSlug: string): string => {
  const base = resolveSiteUrl();
  return `${base}/${locale}/apartments/${encodeURIComponent(apartmentSlug)}/${CATALOG_QR_INTEREST_PATH_SEGMENT}`;
};
