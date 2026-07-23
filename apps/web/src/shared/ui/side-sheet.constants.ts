/**
 * Admin / portal side sheet — card drawer from the right (MaMarie AdminSideSheet pattern).
 * @see https://ma-marie.vercel.app/
 */

/** Desktop/mobile panel width as % of viewport (default size). */
export const SIDE_SHEET_WIDTH_PERCENT = 50;

/** Compact sheet max width (px) — forms like New Company. */
export const SIDE_SHEET_COMPACT_MAX_WIDTH_PX = 420;

/** Slightly wider compact sheet (px) — denser forms like New Provider. */
export const SIDE_SHEET_COMFORTABLE_MAX_WIDTH_PX = 500;

/** Panel slide duration (ms) — matches `--duration-slow` for a softer glide. */
export const SIDE_SHEET_PANEL_TRANSITION_MS = 400;

/** Backdrop fade duration (ms). */
export const SIDE_SHEET_BACKDROP_TRANSITION_MS = 280;

/** Overlay stacking — above header/overlay (`--z-sheet` = 130). */
export const SIDE_SHEET_Z_INDEX = 130;

/** Panel above close tab. */
export const SIDE_SHEET_PANEL_Z_INDEX = 2;

/** Close tab under panel edge. */
export const SIDE_SHEET_CLOSE_TAB_Z_INDEX = 1;

/** Side-tab close pill — total width (px); half sits under drawer edge. */
export const SIDE_SHEET_CLOSE_TAB_WIDTH_PX = 80;

/** Side-tab close pill — height (px). */
export const SIDE_SHEET_CLOSE_TAB_HEIGHT_PX = 38;

/** Side-tab close control — offset from drawer top (px). */
export const SIDE_SHEET_CLOSE_BUTTON_TOP_PX = 22;

/** Side-tab close icon size (px). */
export const SIDE_SHEET_CLOSE_ICON_SIZE_PX = 16;

/** Side-tab close icon stroke width. */
export const SIDE_SHEET_CLOSE_ICON_STROKE_WIDTH = 3;

/** Side-tab close icon horizontal nudge (px). */
export const SIDE_SHEET_CLOSE_ICON_OFFSET_X_PX = 2;

/** Close tab hover scale. */
export const SIDE_SHEET_CLOSE_TAB_HOVER_SCALE = 1.06;

/** Close tab hover transition (ms). */
export const SIDE_SHEET_CLOSE_TAB_TRANSITION_MS = 200;

/** Nested sheet horizontal inset (px). */
export const SIDE_SHEET_STACK_OFFSET_PX = 12;

/** Nested sheet z-index step. */
export const SIDE_SHEET_STACK_Z_STEP = 5;
