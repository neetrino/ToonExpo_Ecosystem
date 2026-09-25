import type { LocaleTextMap } from './portal.js';

/** One resolved home hero slide (media id + public R2 URL). */
export type HomeHeroSlide = {
  mediaAssetId: string;
  imageUrl: string;
};

/** Localized home hero headline + subheadline (empty locale → i18n fallback). */
export type HomeHeroCopy = {
  title: LocaleTextMap;
  subtitle: LocaleTextMap;
};

/**
 * Public home hero — ordered slides for the carousel plus optional CMS copy.
 * Empty `slides` → client uses the default static asset.
 */
export type PublicHomeHero = HomeHeroCopy & {
  slides: HomeHeroSlide[];
};

/** Admin home hero payload (includes last update time when configured). */
export type AdminHomeHero = PublicHomeHero & {
  updatedAt: string | null;
};

/**
 * Admin PATCH body — ordered media asset ids plus optional headline copy.
 * `mediaAssetIds` `null` or `[]` clears custom banners (fallback to default asset).
 * Omitted `title` / `subtitle` leaves stored copy unchanged.
 */
export type UpdateHomeHeroRequest = {
  mediaAssetIds: string[] | null;
  title?: LocaleTextMap;
  subtitle?: LocaleTextMap;
};

/**
 * Toggleable public site pages (home `/` is always on and not listed).
 * Keys match primary marketing routes under `apps/web`.
 */
export const PUBLIC_SITE_PAGE_KEYS = [
  'apartments',
  'projects',
  'partners',
  'insights',
  'mortgage',
  'expo',
  'map',
  'discover',
] as const;

export type PublicSitePageKey = (typeof PUBLIC_SITE_PAGE_KEYS)[number];

/** Enabled map for every public site page key. */
export type PublicSitePages = Record<PublicSitePageKey, boolean>;

/** Public GET payload for which marketing pages are visible. */
export type PublicSitePagesResponse = {
  pages: PublicSitePages;
};

/** Admin GET payload (includes last update time when configured). */
export type AdminSitePagesResponse = PublicSitePagesResponse & {
  updatedAt: string | null;
};

/** Admin PATCH body — full enabled map for all known page keys. */
export type UpdatePublicSitePagesRequest = {
  pages: PublicSitePages;
};
