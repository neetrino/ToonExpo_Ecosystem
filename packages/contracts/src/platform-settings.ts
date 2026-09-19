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
