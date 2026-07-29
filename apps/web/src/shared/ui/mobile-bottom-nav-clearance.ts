/**
 * Bottom padding so scrollable sheets / overlays clear the fixed mobile bottom nav.
 * Bottom nav sits above sheets (`--z-bottom-nav` > `--z-sheet`).
 * Matches Figma 134:119 height: 13px + 56px + max(7px, safe-area) + breathing room.
 */
export const MOBILE_BOTTOM_NAV_SHEET_PB_CLASS =
  'max-md:pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))]';
