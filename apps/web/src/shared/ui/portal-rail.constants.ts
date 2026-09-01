/** Expanded desktop management portal rail (matches legacy `w-72`). */
export const PORTAL_RAIL_WIDTH_EXPANDED_CLASS = 'w-72';

/** Collapsed rail — icons-only strip (~4.5rem / 72px). */
export const PORTAL_RAIL_WIDTH_COLLAPSED_CLASS = 'w-[4.5rem]';

export const PORTAL_RAIL_WIDTH_TRANSITION_CLASS =
  'transition-[width] duration-[var(--duration-base)] ease-[var(--ease-out-premium)] motion-reduce:transition-none';

export const PORTAL_RAIL_INSET_TRANSITION_CLASS =
  'transition-[left] duration-[var(--duration-base)] ease-[var(--ease-out-premium)] motion-reduce:transition-none';

/**
 * Float the rail below SiteHeader (`4.5rem` spacer) with a clear air gap
 * so the rounded teal panel does not kiss the pill.
 */
export const PORTAL_RAIL_TOP_CLASS =
  'top-[calc(4.5rem+0.75rem+env(safe-area-inset-top,0px))]';

/** Default localStorage key when layouts do not override. */
export const PORTAL_RAIL_COLLAPSED_STORAGE_KEY = 'toonexpo.portal.rail-collapsed';

export const PORTAL_RAIL_DESKTOP_ID = 'portal-desktop-rail';
