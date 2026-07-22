/**
 * Client-only module flag: survives soft navigations (locale switch)
 * but resets on full document reload so first visit still animates.
 */
let entranceMotionSettled = false;
/** Last path without locale — used to skip page-enter on language change. */
let lastPathnameWithoutLocale: string | null = null;

/** True after the first entrance animations have completed this page session. */
export const isEntranceMotionSettled = (): boolean => entranceMotionSettled;

/** Call once entrance animations have played (or been skipped). */
export const markEntranceMotionSettled = (): void => {
  entranceMotionSettled = true;
};

/**
 * Whether `page-enter` should run for this pathname.
 * Same pathname + remount (locale switch) → false; first load / new route → true.
 */
export const shouldPlayPageEnter = (pathname: string): boolean => {
  if (lastPathnameWithoutLocale === pathname) {
    return false;
  }
  lastPathnameWithoutLocale = pathname;
  return true;
};
