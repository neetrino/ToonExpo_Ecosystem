import { SUPPORTED_LOCALES } from '@toonexpo/shared';

import { extractQrToken } from '@/features/builder/utils/extract-qr-token';

const LOCALE_PREFIX_PATTERN = new RegExp(`^/(${SUPPORTED_LOCALES.join('|')})(?=/|$)`, 'i');

const ALLOWED_PATH_PREFIXES = ['/projects/', '/qr/'] as const;

const stripLocalePrefix = (path: string): string => {
  const stripped = path.replace(LOCALE_PREFIX_PATTERN, '');
  return stripped.length > 0 ? stripped : '/';
};

const isAllowedAppPath = (path: string): boolean =>
  ALLOWED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));

/**
 * Maps a camera QR payload to an in-app href (project page, buyer QR, etc.).
 */
export const resolveScannedHref = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const buyerToken = extractQrToken(trimmed);
  if (buyerToken) {
    return `/qr/${buyerToken}`;
  }

  let path: string | null = null;

  try {
    const url = new URL(trimmed);
    path = stripLocalePrefix(`${url.pathname}${url.search}${url.hash}`);
  } catch {
    if (trimmed.startsWith('/')) {
      path = stripLocalePrefix(trimmed);
    }
  }

  if (!path || path === '/' || !isAllowedAppPath(path)) {
    return null;
  }

  return path;
};
