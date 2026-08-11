/** Debounce before public projects keyword search updates the URL. */
export const PROJECTS_SEARCH_DEBOUNCE_MS = 300;

/** Room-count options for the public projects multi-select filter (`4` = 4+). */
export const PROJECT_ROOM_FILTER_VALUES = ['1', '2', '3', '4'] as const;

/** Anchor for pagination — scroll here instead of the document top. */
export const CATALOG_RESULTS_SCROLL_ID = 'catalog-results';

/**
 * Clears fixed header / pill chrome so the results block sits under the navbar.
 */
export const CATALOG_RESULTS_SCROLL_MARGIN_CLASS =
  'scroll-mt-[calc(5.5rem+env(safe-area-inset-top,0px))]';


