/** Empty select value = no filter (NBOS “all”). */
export const INTEGRATED_SEARCH_FILTER_ALL_VALUE = '';

/** Inline chips up to this many total selections; above → single count chip. */
export const INTEGRATED_SEARCH_INLINE_SELECTION_LIMIT = 3;

/** Synthetic chip key when total selections exceed the inline limit. */
export const INTEGRATED_SEARCH_FILTER_SUMMARY_CHIP_KEY = '__filter_summary__';

/** Chip key delimiter for a single value inside a multi-select filter. */
export const INTEGRATED_SEARCH_FILTER_CHIP_KEY_SEPARATOR = '::';

/** Portaled filter panel surface — fixed width so end-aligned portals don’t clip. */
export const INTEGRATED_SEARCH_FILTER_PANEL_SURFACE =
  'box-border w-80 rounded-xl border border-border bg-surface-elevated p-4 sm:w-[30rem]';

/** Filter fields wrap so every control stays inside the panel. */
export const INTEGRATED_SEARCH_FILTER_PANEL_GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2';

/** Search field min width — keeps magnifier visible when chips are active. */
export const INTEGRATED_SEARCH_BAR_FIELD_MIN_WIDTH_CLASS = 'min-w-[5.5rem]';
