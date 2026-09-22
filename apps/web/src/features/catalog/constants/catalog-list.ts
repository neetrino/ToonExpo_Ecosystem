/** Anchor for catalog list pagination — scroll here instead of the document top. */
export const CATALOG_RESULTS_SCROLL_ID = 'catalog-results';

/**
 * Clears fixed header / pill chrome so the results block sits under the navbar.
 */
export const CATALOG_RESULTS_SCROLL_MARGIN_CLASS =
  'scroll-mt-[calc(4.5rem+env(safe-area-inset-top,0px))]';

/** Stretch grid cells so cards in the same row share height. */
export const CATALOG_CARD_CELL_FILL_CLASS = '[&>*]:h-full [&>*]:min-w-0';

/** Two-line description slot reserved even when copy is missing. */
export const CATALOG_CARD_DESCRIPTION_CLASS =
  'mb-4 line-clamp-2 min-h-8 text-xs leading-4 text-header-muted';
