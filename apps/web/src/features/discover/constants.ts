/** How many published projects to expand into apartment cards. */
export const DISCOVER_PROJECT_FETCH_LIMIT = 12;

/** Max apartments in one discover deck. */
export const DISCOVER_APARTMENT_LIMIT = 40;

/** Horizontal travel (px) to commit like / skip. */
export const DISCOVER_SWIPE_COMMIT_PX = 112;

/** Flick velocity (px/ms) to commit swipe. */
export const DISCOVER_SWIPE_COMMIT_VELOCITY = 0.55;

/** Max card tilt while dragging (deg). */
export const DISCOVER_SWIPE_MAX_ROTATION_DEG = 12;

/** Fly-off distance after commit (px). */
export const DISCOVER_SWIPE_EXIT_PX = 480;

/** Exit animation duration (ms). */
export const DISCOVER_SWIPE_EXIT_MS = 280;

/**
 * Viewport height between SiteHeader spacer and MobileBottomNavSpacer.
 * Matches header spacer (4.5rem + safe-top) and bottom nav (4.3125rem + max(7px, safe-bottom)).
 */
export const DISCOVER_VIEWPORT_HEIGHT_CLASS =
  'h-[calc(100dvh-4.5rem-4.3125rem-env(safe-area-inset-top,0px)-max(0.4375rem,env(safe-area-inset-bottom,0px)))] lg:h-[calc(100dvh-4.5rem-env(safe-area-inset-top,0px))]';
