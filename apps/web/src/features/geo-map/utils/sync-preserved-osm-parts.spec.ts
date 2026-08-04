import { describe, expect, it } from 'vitest';

import type { MapLibreMap } from 'maplibre-gl';

import type { PreservedOsmSiblingPart } from '@/features/geo-map/types';
import {
  dedupePreservedSiblingParts,
  preservedSiblingPartDedupeKey,
} from '@/features/geo-map/utils/preserved-osm-sibling-dedupe';
import { resolvePreservedSiblingsFromMap } from '@/features/geo-map/utils/sync-preserved-osm-parts';

const square = (west: number, south: number, size: number): number[][] => [
  [west, south],
  [west + size, south],
  [west + size, south + size],
  [west, south + size],
  [west, south],
];

const partFromOuter = (
  outer: number[][],
  heightM = 12,
  minHeightM = 0,
): PreservedOsmSiblingPart => ({
  geometry: { type: 'Polygon', coordinates: [outer] },
  heightM,
  minHeightM,
});

describe('preservedSiblingPartDedupeKey', () => {
  it('is stable for the same outer ring', () => {
    const part = partFromOuter(square(44.5, 40.1, 0.001));
    expect(preservedSiblingPartDedupeKey(part)).toBe(preservedSiblingPartDedupeKey(part));
  });

  it('changes when the first coordinate moves', () => {
    const a = partFromOuter(square(44.5, 40.1, 0.001));
    const b = partFromOuter(square(44.6, 40.1, 0.001));
    expect(preservedSiblingPartDedupeKey(a)).not.toBe(preservedSiblingPartDedupeKey(b));
  });
});

describe('dedupePreservedSiblingParts', () => {
  it('keeps one copy of identical geometries', () => {
    const a = partFromOuter(square(44.5, 40.1, 0.001));
    const b = partFromOuter(square(44.5, 40.1, 0.001), 20);
    const c = partFromOuter(square(44.51, 40.11, 0.001));
    const result = dedupePreservedSiblingParts([a, b, c]);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(a);
    expect(result[1]).toBe(c);
  });
});

describe('resolvePreservedSiblingsFromMap', () => {
  const nearOuter = square(44.51, 40.18, 0.0002);
  /** ~1.7 km east of `nearOuter` — beyond the 120 m hide-scope radius. */
  const farOuter = square(44.53, 40.18, 0.0002);
  const otherNearOuter = square(44.5105, 40.1805, 0.0002);

  const createMap = (features: readonly Record<string, unknown>[]): MapLibreMap =>
    ({
      getLayer: (layerId: string) =>
        layerId === 'building-3d' ? { source: 'openmaptiles', sourceLayer: 'building' } : undefined,
      querySourceFeatures: () => features,
    }) as unknown as MapLibreMap;

  it('collects siblings from every matching feature id without radius-capping results', () => {
    const map = createMap([
      {
        id: 42,
        type: 'Feature',
        properties: { height: 18 },
        geometry: {
          type: 'MultiPolygon',
          coordinates: [[nearOuter], [farOuter]],
        },
      },
      {
        id: 42,
        type: 'Feature',
        properties: { height: 18 },
        geometry: {
          type: 'MultiPolygon',
          coordinates: [[nearOuter], [otherNearOuter]],
        },
      },
      {
        id: 99,
        type: 'Feature',
        properties: { height: 10 },
        geometry: {
          type: 'Polygon',
          coordinates: [square(44.6, 40.2, 0.0002)],
        },
      },
    ]);

    const parts = resolvePreservedSiblingsFromMap(map, 42, 44.5101, 40.1801);
    expect(parts.length).toBeGreaterThanOrEqual(2);

    const firstCoords = parts.map((part) => part.geometry.coordinates[0]?.[0] ?? []);
    expect(firstCoords).toContainEqual(farOuter[0]);
    expect(firstCoords).toContainEqual(otherNearOuter[0]);
  });

  it('accepts a matching-id feature near the anchor even when the point is outside', () => {
    const map = createMap([
      {
        id: 'fid-7',
        type: 'Feature',
        properties: { height: 14 },
        geometry: {
          type: 'MultiPolygon',
          coordinates: [[nearOuter], [farOuter]],
        },
      },
    ]);

    // Anchor ~30 m north of the near square — outside the footprint, within 120 m.
    const parts = resolvePreservedSiblingsFromMap(map, 'fid-7', 44.5101, 40.18035);
    expect(parts.some((part) => part.geometry.coordinates[0]?.[0]?.[0] === farOuter[0]?.[0])).toBe(
      true,
    );
  });

  it('rejects matching-id features whose nearest vertex is beyond the hide scope', () => {
    const map = createMap([
      {
        id: 42,
        type: 'Feature',
        properties: { height: 18 },
        geometry: {
          type: 'MultiPolygon',
          coordinates: [[farOuter], [square(44.531, 40.18, 0.0002)]],
        },
      },
    ]);

    const parts = resolvePreservedSiblingsFromMap(map, 42, 44.5101, 40.1801);
    expect(parts).toEqual([]);
  });
});
