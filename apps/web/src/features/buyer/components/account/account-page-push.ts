/** Matches `--duration-slow` in globals.css. */
export const ACCOUNT_PAGE_PUSH_MS = 400;

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
