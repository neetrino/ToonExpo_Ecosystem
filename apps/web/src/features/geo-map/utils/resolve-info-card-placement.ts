import {
  GEO_MAP_INFO_CARD_EDGE_MARGIN_PX,
  GEO_MAP_INFO_CARD_ESTIMATED_HEIGHT_PX,
  GEO_MAP_INFO_CARD_PIN_GAP_PX,
  GEO_MAP_INFO_CARD_WIDTH_PX,
  MARKER_PIN_HEIGHT_PX,
} from '@/features/geo-map/constants';
import type { MapAnchoredScreenPoint } from '@/features/geo-map/hooks/use-map-anchored-screen-point';

/** Which side of the pin the card is rendered on (tail direction follows it). */
export type GeoMapInfoCardSide = 'above' | 'below';

export type GeoMapInfoCardPlacement = {
  /** Card anchor in container pixels (card is centered horizontally on `x`). */
  x: number;
  y: number;
  side: GeoMapInfoCardSide;
};

const clamp = (value: number, min: number, max: number): number =>
  max < min ? (min + max) / 2 : Math.min(max, Math.max(min, value));

/**
 * Places the hover card next to its pin: centered above the pin head when there
 * is room, flipped below otherwise, and clamped so the card stays inside the map.
 */
export const resolveInfoCardPlacement = (
  point: MapAnchoredScreenPoint,
): GeoMapInfoCardPlacement => {
  const halfWidth = GEO_MAP_INFO_CARD_WIDTH_PX / 2;
  const x = clamp(
    point.x,
    GEO_MAP_INFO_CARD_EDGE_MARGIN_PX + halfWidth,
    point.containerWidth - GEO_MAP_INFO_CARD_EDGE_MARGIN_PX - halfWidth,
  );

  const aboveY = point.y - MARKER_PIN_HEIGHT_PX - GEO_MAP_INFO_CARD_PIN_GAP_PX;
  const fitsAbove =
    aboveY - GEO_MAP_INFO_CARD_ESTIMATED_HEIGHT_PX >= GEO_MAP_INFO_CARD_EDGE_MARGIN_PX;

  if (fitsAbove) {
    return { x, y: aboveY, side: 'above' };
  }
  return { x, y: point.y + GEO_MAP_INFO_CARD_PIN_GAP_PX, side: 'below' };
};
