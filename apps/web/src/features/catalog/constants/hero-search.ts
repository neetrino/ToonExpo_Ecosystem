/** Min characters before hero keyword suggestions open. */
export const HERO_KEYWORD_MIN_QUERY_LENGTH = 1;

/** Max rows in the hero keyword suggestions listbox. */
export const HERO_KEYWORD_MAX_SUGGESTIONS = 8;

/** Scrollable viewport for hero keyword suggestions (matches location filter). */
export const HERO_KEYWORD_SUGGESTIONS_SCROLL_CLASS =
  'luxury-scrollbar max-h-56 overflow-y-auto overscroll-contain';

/** Delay before closing suggestions on blur so option click can fire. */
export const HERO_KEYWORD_BLUR_CLOSE_DELAY_MS = 120;

/** Catalog slice size for home hero keyword suggestions + city options. */
export const HOME_HERO_CATALOG_PAGE_SIZE = 50;
