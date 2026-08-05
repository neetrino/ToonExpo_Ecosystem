import { describe, expect, it } from 'vitest';

import {
  GEO_MAP_INFO_CARD_EDGE_MARGIN_PX,
  GEO_MAP_INFO_CARD_PIN_GAP_PX,
  GEO_MAP_INFO_CARD_WIDTH_PX,
  MARKER_PIN_HEIGHT_PX,
} from '@/features/geo-map/constants';
import { resolveInfoCardPlacement } from '@/features/geo-map/utils/resolve-info-card-placement';

const point = (x: number, y: number) => ({
  x,
  y,
  containerWidth: 1000,
  containerHeight: 600,
});

describe('resolveInfoCardPlacement', () => {
  it('sits above the pin head when there is room', () => {
    expect(resolveInfoCardPlacement(point(500, 400))).toEqual({
      x: 500,
      y: 400 - MARKER_PIN_HEIGHT_PX - GEO_MAP_INFO_CARD_PIN_GAP_PX,
      side: 'above',
    });
  });

  it('flips below the pin near the top edge', () => {
    expect(resolveInfoCardPlacement(point(500, 60))).toEqual({
      x: 500,
      y: 60 + GEO_MAP_INFO_CARD_PIN_GAP_PX,
      side: 'below',
    });
  });

  it('clamps horizontally so the card stays inside the map', () => {
    const halfWidth = GEO_MAP_INFO_CARD_WIDTH_PX / 2;
    expect(resolveInfoCardPlacement(point(10, 400)).x).toBe(
      GEO_MAP_INFO_CARD_EDGE_MARGIN_PX + halfWidth,
    );
    expect(resolveInfoCardPlacement(point(990, 400)).x).toBe(
      1000 - GEO_MAP_INFO_CARD_EDGE_MARGIN_PX - halfWidth,
    );
  });

  it('centers the card when the map is narrower than the card', () => {
    expect(
      resolveInfoCardPlacement({ x: 40, y: 400, containerWidth: 200, containerHeight: 600 }).x,
    ).toBe(100);
  });
});
