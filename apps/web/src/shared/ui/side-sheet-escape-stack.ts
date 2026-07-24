/**
 * Tracks open side-sheet stack levels so only the topmost handles Escape.
 */

const activeLevels = new Set<number>();

/** Registers a rendered sheet level; returns unregister. */
export const registerSideSheetLevel = (level: number): (() => void) => {
  activeLevels.add(level);
  return () => {
    activeLevels.delete(level);
  };
};

/** True when this stack level is the topmost registered sheet. */
export const isTopSideSheetLevel = (level: number): boolean => {
  let maxLevel = Number.NEGATIVE_INFINITY;
  for (const active of activeLevels) {
    if (active > maxLevel) {
      maxLevel = active;
    }
  }
  return level === maxLevel;
};
