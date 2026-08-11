/**
 * Supported UI locales for ToonExpo (Armenian, Russian, English).
 */
export const SUPPORTED_LOCALES = ['hy', 'ru', 'en'] as const;

/**
 * Locale code used when no preference is available (UI shell).
 * English is the platform default for first open / unprefixed redirects.
 */
export const DEFAULT_LOCALE = 'en' as const;

/**
 * Catalog content canonical locale (Armenian primary text store).
 * Public display uses the active locale only — no cross-language fallback.
 */
export const CATALOG_CONTENT_FALLBACK_LOCALE = 'hy' as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Returns true when the value is a supported locale code.
 */
export const isSupportedLocale = (value: string): value is SupportedLocale => {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
};

/**
 * Normalizes a catalog content locale; unknown values fall back to Armenian.
 */
export const resolveCatalogLocale = (value: string | undefined | null): SupportedLocale => {
  if (value && isSupportedLocale(value)) {
    return value;
  }

  return CATALOG_CONTENT_FALLBACK_LOCALE;
};

/** Next Data Cache TTL for catalog, builders, exhibition, visual-map (30 min). */
export const PUBLIC_CACHE_TTL_CATALOG_SECONDS = 1_800;

/** Next Data Cache TTL for partners and mortgage offers (60 min). */
export const PUBLIC_CACHE_TTL_PARTNERS_SECONDS = 3_600;

/** Shared Next Data Cache tags for anonymous public fetches + publish purge. */
export const PUBLIC_CACHE_TAG = {
  CATALOG: 'catalog',
  PARTNERS: 'partners',
  MORTGAGE: 'mortgage',
  EXHIBITION: 'exhibition',
  VISUAL_MAP: 'visual-map',
  GEO_MAP: 'geo-map',
  HOME: 'home',
} as const;

export type PublicCacheTag = (typeof PUBLIC_CACHE_TAG)[keyof typeof PUBLIC_CACHE_TAG];

/** Per-project catalog detail tag (`catalog-project-<id>`). */
export const catalogProjectCacheTag = (projectId: string): string => `catalog-project-${projectId}`;
