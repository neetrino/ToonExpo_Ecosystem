import { resolveSiteUrl } from '@/shared/config/site-url';

/**
 * Absolute public project page URL encoded in project QR printouts / detail pages.
 */
export const buildProjectCatalogQrUrl = (locale: string, projectId: string): string => {
  const base = resolveSiteUrl();
  return `${base}/${locale}/projects/${encodeURIComponent(projectId)}`;
};

/**
 * Absolute public apartment page URL for apartment detail QR.
 */
export const buildApartmentCatalogQrUrl = (locale: string, apartmentId: string): string => {
  const base = resolveSiteUrl();
  return `${base}/${locale}/apartments/${encodeURIComponent(apartmentId)}`;
};
