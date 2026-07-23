/**
 * Locks document scroll without layout jump when the scrollbar disappears.
 */

let lockCount = 0;
let previousBodyOverflow = '';
let previousHtmlOverflow = '';
let previousBodyPaddingRight = '';

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
    previousBodyOverflow = document.body.style.overflow;
    previousHtmlOverflow = document.documentElement.style.overflow;
    previousBodyPaddingRight = document.body.style.paddingRight;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

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
};
