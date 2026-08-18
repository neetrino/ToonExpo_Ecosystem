import { staticAssetUrl } from '@/shared/lib/static-asset-url';

/** Figma photo node `89:1399` — used when no platform hero is configured. */
export const DEFAULT_HOME_HERO_IMAGE_SRC = staticAssetUrl('/images/hero-building.webp');

/** Auto-advance interval for the public home hero carousel (~7.5s). */
export const HOME_HERO_ROTATE_MS = 7_500;

/** Soft dissolve length between slides — keep below {@link HOME_HERO_ROTATE_MS}. */
export const HOME_HERO_CROSSFADE_MS = 1_800;

/** Max banners — keep in sync with API `HOME_HERO_MAX_SLIDES`. */
export const HOME_HERO_MAX_SLIDES = 8;

/** Mobile prev/next — compact so they sit in the gutter between stacked search fields. */
export const HOME_HERO_NAV_MOBILE_BUTTON_CLASS = 'size-9';
export const HOME_HERO_NAV_MOBILE_ICON_CLASS = 'size-4';

/** Desktop prev/next — edge controls on the full-bleed hero. */
export const HOME_HERO_NAV_DESKTOP_BUTTON_CLASS = 'size-11';
export const HOME_HERO_NAV_DESKTOP_ICON_CLASS = 'size-5';

/**
 * Pull mobile gap-nav to the search card edges.
 * Matches hero search chrome: form `p-2` + inner `p-3`.
 */
export const HOME_HERO_NAV_MOBILE_INSET_CLASS = '-inset-x-5';

/** Nudge mobile prev/next 2px below the field-gap center. */
export const HOME_HERO_NAV_MOBILE_TOP_CLASS = 'top-[calc(50%+2px)]';
