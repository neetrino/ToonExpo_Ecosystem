/**
 * Locks document scroll without layout jump when the scrollbar disappears.
 * Uses `position: fixed` so iOS Safari cannot scroll the page behind overlays.
 */

let lockCount = 0;
let previousBodyOverflow = '';
let previousHtmlOverflow = '';
let previousBodyPaddingRight = '';
let previousBodyPosition = '';
let previousBodyTop = '';
let previousBodyWidth = '';
let lockedScrollY = 0;

const getScrollbarWidthPx = (): number => {
  if (typeof window === 'undefined') {
    return 0;
  }
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
};

/** Locks page scroll; compensates scrollbar width so content does not shrink. */
export const lockBodyScroll = (): void => {
  if (typeof document === 'undefined') {
    return;
  }

  if (lockCount === 0) {
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

    if (scrollbarWidthPx > 0) {
      const currentPadding = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${currentPadding + scrollbarWidthPx}px`;
    }
  }

  lockCount += 1;
};

/** Restores page scroll when the last lock is released. */
export const unlockBodyScroll = (): void => {
  if (typeof document === 'undefined') {
    return;
  }

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount !== 0) {
    return;
  }

  document.body.style.overflow = previousBodyOverflow;
  document.documentElement.style.overflow = previousHtmlOverflow;
  document.body.style.paddingRight = previousBodyPaddingRight;
  document.body.style.position = previousBodyPosition;
  document.body.style.top = previousBodyTop;
  document.body.style.width = previousBodyWidth;
  window.scrollTo(0, lockedScrollY);
};
