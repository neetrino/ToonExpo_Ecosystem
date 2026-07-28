/**
 * Bottom padding so scrollable sheets / overlays clear the fixed mobile bottom nav.
 * Bottom nav sits above sheets (`--z-bottom-nav` > `--z-sheet`).
 */
export const MOBILE_BOTTOM_NAV_SHEET_PB_CLASS =
  'max-md:pb-[calc(7.25rem+env(safe-area-inset-bottom,0px))]';
