/**
 * Tracks open floor-plan lightboxes so Escape closes them before side sheets.
 */

let openCount = 0;

/** Registers an open lightbox; returns unregister. */
export const registerFloorPlanLightbox = (): (() => void) => {
  openCount += 1;
  return () => {
    openCount = Math.max(0, openCount - 1);
  };
};

/** True when at least one floor-plan lightbox is open. */
export const isFloorPlanLightboxOpen = (): boolean => openCount > 0;
