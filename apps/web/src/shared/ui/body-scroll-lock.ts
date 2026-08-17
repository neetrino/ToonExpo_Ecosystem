/**
 * Locks document scroll without layout jump when the scrollbar disappears.
 * Hard lock uses `position: fixed` for iOS Safari; soft lock is overflow-only
 * (preferred for bottom sheets — avoids unlock paint flash).
 */

let hardLockCount = 0;
let softLockCount = 0;
let previousBodyOverflow = '';
let previousHtmlOverflow = '';
let previousBodyPaddingRight = '';
let previousBodyPosition = '';
let previousBodyTop = '';
let previousBodyWidth = '';
let previousBodyOverscrollBehavior = '';
let lockedScrollY = 0;
let softOwnsOverflow = false;

const getScrollbarWidthPx = (): number => {
  if (typeof window === 'undefined') {
    return 0;
  }
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
};

/**
 * When `scrollbar-gutter: stable` already reserves scrollbar space, adding
 * body `padding-right` double-compensates and leaves an uncovered white strip
 * (overlays portal into the content box, not the padding).
 */
const hasStableScrollbarGutter = (): boolean => {
  if (typeof document === 'undefined') {
    return false;
  }
  const gutter = getComputedStyle(document.documentElement).scrollbarGutter;
  return gutter === 'stable' || gutter.startsWith('stable');
};

const applyHardLockStyles = (): void => {
  const scrollbarWidthPx = getScrollbarWidthPx();
  lockedScrollY = window.scrollY;
  previousBodyOverflow = document.body.style.overflow;
  previousHtmlOverflow = document.documentElement.style.overflow;
  previousBodyPaddingRight = document.body.style.paddingRight;
  previousBodyPosition = document.body.style.position;
  previousBodyTop = document.body.style.top;
  previousBodyWidth = document.body.style.width;

  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.width = '100%';

  if (scrollbarWidthPx > 0 && !hasStableScrollbarGutter()) {
    const currentPadding = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;
    document.body.style.paddingRight = `${currentPadding + scrollbarWidthPx}px`;
  }
};

const clearHardLockStyles = (): void => {
  const scrollY = lockedScrollY;
  document.body.style.overflow = previousBodyOverflow;
  document.documentElement.style.overflow = previousHtmlOverflow;
  document.body.style.paddingRight = previousBodyPaddingRight;
  document.body.style.position = previousBodyPosition;
  document.body.style.top = previousBodyTop;
  document.body.style.width = previousBodyWidth;
  if (typeof window !== 'undefined') {
    window.scrollTo(0, scrollY);
  }
};

/**
 * Hard scroll lock (position: fixed). Prefer {@link lockBodyScrollSoft} for bottom sheets.
 */
export const lockBodyScroll = (): void => {
  if (typeof document === 'undefined') {
    return;
  }

  if (hardLockCount === 0) {
    applyHardLockStyles();
  }

  hardLockCount += 1;
};

/** Restores hard scroll lock when the last hard lock is released. */
export const unlockBodyScroll = (): void => {
  if (typeof document === 'undefined') {
    return;
  }

  hardLockCount = Math.max(0, hardLockCount - 1);
  if (hardLockCount !== 0) {
    return;
  }

  clearHardLockStyles();

  // Soft lock may still need overflow:hidden after hard unlock.
  if (softLockCount > 0 && softOwnsOverflow) {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
  }
};

/**
 * Overflow-only scroll lock for bottom sheets / light overlays.
 * Skips position:fixed so unlock does not flash the page.
 */
export const lockBodyScrollSoft = (): void => {
  if (typeof document === 'undefined') {
    return;
  }

  if (softLockCount === 0 && hardLockCount === 0) {
    previousHtmlOverflow = document.documentElement.style.overflow;
    previousBodyOverflow = document.body.style.overflow;
    previousBodyOverscrollBehavior = document.body.style.overscrollBehavior;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    softOwnsOverflow = true;
  }

  softLockCount += 1;
};

/** Restores soft scroll lock when the last soft lock is released. */
export const unlockBodyScrollSoft = (): void => {
  if (typeof document === 'undefined') {
    return;
  }

  softLockCount = Math.max(0, softLockCount - 1);
  if (softLockCount !== 0 || hardLockCount !== 0 || !softOwnsOverflow) {
    if (softLockCount === 0) {
      softOwnsOverflow = false;
    }
    return;
  }

  document.documentElement.style.overflow = previousHtmlOverflow;
  document.body.style.overflow = previousBodyOverflow;
  document.body.style.overscrollBehavior = previousBodyOverscrollBehavior;
  softOwnsOverflow = false;
};
