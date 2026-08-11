import { staticAssetUrl } from '@/shared/lib/static-asset-url';

/** Figma photo node `89:1399` — used when no platform hero is configured. */
export const DEFAULT_HOME_HERO_IMAGE_SRC = staticAssetUrl('/images/hero-building.webp');

/** Auto-advance interval for the public home hero carousel (~7.5s). */
export const HOME_HERO_ROTATE_MS = 7_500;

/** Soft dissolve length between slides — keep below {@link HOME_HERO_ROTATE_MS}. */
export const HOME_HERO_CROSSFADE_MS = 1_800;

/** Max banners — keep in sync with API `HOME_HERO_MAX_SLIDES`. */
export const HOME_HERO_MAX_SLIDES = 8;
