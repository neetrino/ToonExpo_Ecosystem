import { HOTSPOT_COORD_MAX, HOTSPOT_COORD_MIN } from '@toonexpo/contracts';

/** Bounding rect fields used for percentage hotspot placement. */
export type HotspotImageRect = Pick<DOMRectReadOnly, 'left' | 'top' | 'width' | 'height'>;

const COORD_DECIMALS = 1;

function clampCoord(value: number): number {
  const rounded = Math.round(value * 10 ** COORD_DECIMALS) / 10 ** COORD_DECIMALS;
  return Math.min(HOTSPOT_COORD_MAX, Math.max(HOTSPOT_COORD_MIN, rounded));
}

/**
 * Converts a pointer position within an image bounding rect to hotspot x/y percentages.
 */
export function computeHotspotPercent(
  rect: HotspotImageRect,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  if (rect.width <= 0 || rect.height <= 0) {
    return { x: HOTSPOT_COORD_MIN, y: HOTSPOT_COORD_MIN };
  }

  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;

  return {
    x: clampCoord(x),
    y: clampCoord(y),
  };
}
