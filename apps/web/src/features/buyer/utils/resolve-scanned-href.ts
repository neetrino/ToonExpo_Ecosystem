import { SUPPORTED_LOCALES } from '@toonexpo/shared';

import { extractQrToken } from '@/features/builder/utils/extract-qr-token';
import { CATALOG_QR_INTEREST_PATH_SEGMENT } from '@/features/catalog/utils/build-catalog-entity-qr-url';

const LOCALE_PREFIX_PATTERN = new RegExp(`^/(${SUPPORTED_LOCALES.join('|')})(?=/|$)`, 'i');

/** `/projects/{id}` or `/projects/{id}/interest` (optional trailing slash). */
const PROJECT_QR_PATH_PATTERN = new RegExp(
  `^/projects/([^/]+)(?:/${CATALOG_QR_INTEREST_PATH_SEGMENT})?/?$`,
);

/** `/apartments/{id}` or `/apartments/{id}/interest` (optional trailing slash). */
const APARTMENT_QR_PATH_PATTERN = new RegExp(
  `^/apartments/([^/]+)(?:/${CATALOG_QR_INTEREST_PATH_SEGMENT})?/?$`,
);

const stripLocalePrefix = (path: string): string => {
  const stripped = path.replace(LOCALE_PREFIX_PATTERN, '');
  return stripped.length > 0 ? stripped : '/';
};

const parseAppPath = (raw: string): string | null => {
  try {
    const url = new URL(raw);
    return stripLocalePrefix(`${url.pathname}${url.search}${url.hash}`);
  } catch {
    if (raw.startsWith('/')) {
      return stripLocalePrefix(raw);
    }
  }
  return null;
};

/**
 * Catalog entity QR → interest landing (notes form). Nested building/floor paths stay unchanged.
 */
const toCatalogInterestHref = (path: string): string | null => {
  const pathOnly = path.split(/[?#]/, 1)[0] ?? path;

  const projectMatch = pathOnly.match(PROJECT_QR_PATH_PATTERN);
  if (projectMatch?.[1]) {
    return `/projects/${projectMatch[1]}/${CATALOG_QR_INTEREST_PATH_SEGMENT}`;
  }

  const apartmentMatch = pathOnly.match(APARTMENT_QR_PATH_PATTERN);
  if (apartmentMatch?.[1]) {
    return `/apartments/${apartmentMatch[1]}/${CATALOG_QR_INTEREST_PATH_SEGMENT}`;
  }

  return null;
};

/**
 * Maps a camera QR payload to an in-app href (project/apartment interest, buyer QR).
 */
export const resolveScannedHref = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  // Prefer catalog deep links over opaque buyer-token matching.
  const appPath = parseAppPath(trimmed);
  if (appPath && appPath !== '/') {
    const interestHref = toCatalogInterestHref(appPath);
    if (interestHref) {
      return interestHref;
    }
  }

  const buyerToken = extractQrToken(trimmed);
  if (buyerToken) {
    return `/qr/${buyerToken}`;
  }

  return null;
};
