import {
  PUBLIC_SITE_PAGE_KEYS,
  type PublicSitePageKey,
  type PublicSitePages,
} from '@toonexpo/contracts';

/**
 * All pages enabled — used when the setting is missing or invalid.
 */
export const defaultPublicSitePages = (): PublicSitePages => {
  const pages = {} as PublicSitePages;
  for (const key of PUBLIC_SITE_PAGE_KEYS) {
    pages[key] = true;
  }
  return pages;
};

const isPageKey = (value: string): value is PublicSitePageKey =>
  (PUBLIC_SITE_PAGE_KEYS as readonly string[]).includes(value);

/**
 * Parses stored JSON into a complete enabled map (unknown keys ignored; missing → true).
 */
export const parsePublicSitePages = (raw: string | undefined): PublicSitePages => {
  const fallback = defaultPublicSitePages();
  if (!raw || raw.trim().length === 0) {
    return fallback;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return fallback;
    }

    const record = parsed as Record<string, unknown>;
    const next = { ...fallback };
    for (const key of PUBLIC_SITE_PAGE_KEYS) {
      const value = record[key];
      if (typeof value === 'boolean') {
        next[key] = value;
      }
    }
    return next;
  } catch {
    return fallback;
  }
};

/**
 * Normalizes an admin PATCH payload to a complete map of known keys only.
 */
export const normalizePublicSitePages = (input: PublicSitePages): PublicSitePages => {
  const next = defaultPublicSitePages();
  for (const key of PUBLIC_SITE_PAGE_KEYS) {
    if (typeof input[key] === 'boolean') {
      next[key] = input[key];
    }
  }
  return next;
};

export const isPublicSitePageKey = isPageKey;
