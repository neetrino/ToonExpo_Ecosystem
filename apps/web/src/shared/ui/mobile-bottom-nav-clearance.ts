/**
 * Bottom padding so scrollable sheets / overlays clear the fixed mobile bottom nav.
 * Bottom nav sits above sheets (`--z-bottom-nav` > `--z-sheet`) and is visible
 * below `lg` — match that breakpoint (not only `md`) so iPad Mini / tablets clear the bar.
 * Matches Figma 134:119 height: 13px + 56px + max(7px, safe-area) + breathing room.
 */
export const MOBILE_BOTTOM_NAV_SHEET_PB_CLASS =
  'max-lg:pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))]';

/**
 * Padding for rail/sidebar nav text while the dark chrome extends under the bottom bar.
 * Matches Figma 134:119 height (13px + 56px + max(7px, safe-area)); bar stays above via z-index.
 */
export const MOBILE_BOTTOM_NAV_CONTENT_PB_CLASS =
  'max-lg:pb-[calc(4.3125rem+max(0.4375rem,env(safe-area-inset-bottom,0px)))]';
