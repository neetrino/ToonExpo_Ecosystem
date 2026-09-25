/** Legacy single-id key (migrated on read to slides JSON). */
export const PLATFORM_SETTING_HOME_HERO_MEDIA_ID = 'home.hero.mediaAssetId';

/** Current key — JSON array of media asset ids (ordered). */
export const PLATFORM_SETTING_HOME_HERO_SLIDES = 'home.hero.slides';

export const PLATFORM_SETTING_HOME_HERO_DESCRIPTION =
  'Ordered media asset ids for the public home page hero banner carousel';

/** JSON `{ title, subtitle }` locale maps for the public home hero headline. */
export const PLATFORM_SETTING_HOME_HERO_COPY = 'home.hero.copy';

export const PLATFORM_SETTING_HOME_HERO_COPY_DESCRIPTION =
  'Localized title and subtitle for the public home page hero';

/** Max banners an admin can configure on the home hero. */
export const HOME_HERO_MAX_SLIDES = 8;

/** Max characters for the home hero H1 (per locale). */
export const HOME_HERO_TITLE_MAX_LENGTH = 200;

/** Max characters for the home hero subheadline (per locale). */
export const HOME_HERO_SUBTITLE_MAX_LENGTH = 400;

/** JSON map of public marketing page keys → enabled booleans. */
export const PLATFORM_SETTING_PUBLIC_SITE_PAGES = 'site.publicPages';

export const PLATFORM_SETTING_PUBLIC_SITE_PAGES_DESCRIPTION =
  'Which public marketing pages are visible in nav and reachable by URL';
