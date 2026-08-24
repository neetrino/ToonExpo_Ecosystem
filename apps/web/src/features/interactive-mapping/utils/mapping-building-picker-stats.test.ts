import { describe, expect, it } from 'vitest';

import type {
  InteractiveMappingApartmentSummary,
  InteractiveMappingCanvasSummary,
  InteractiveMappingFloorSummary,
} from '@toonexpo/contracts';

import { resolveMappingBuildingPickerStats } from './mapping-building-picker-stats';

const floor = (
  overrides: Partial<InteractiveMappingFloorSummary> & Pick<InteractiveMappingFloorSummary, 'id'>,
): InteractiveMappingFloorSummary => ({
  buildingId: 'b1',
  number: 1,
  name: null,
  floorplanMediaId: null,
  publicationStatus: 'published',
  hasBuildingPolygon: false,
  hasFloorPlan: false,
  ...overrides,
});

const canvas = (
  overrides: Partial<InteractiveMappingCanvasSummary> &
    Pick<InteractiveMappingCanvasSummary, 'id' | 'contextId'>,
): InteractiveMappingCanvasSummary => ({
  contextType: 'building',
  mediaAssetId: 'media_1',
  mediaUrl: 'https://cdn.example/render.jpg',
  mediaWidth: 900,
  mediaHeight: 1200,
  publicationStatus: 'published',
  isPrimary: true,
  hotspotCount: 5,
  updatedAt: '2026-08-22T10:00:00.000Z',
  ...overrides,
});

const apartment = (
  overrides: Partial<InteractiveMappingApartmentSummary> &
    Pick<InteractiveMappingApartmentSummary, 'id'>,
): InteractiveMappingApartmentSummary => ({
  buildingId: 'b1',
  floorId: 'f1',
  number: '101',
  publicationStatus: 'published',
  areaTotal: null,
  ...overrides,
});

describe('resolveMappingBuildingPickerStats', () => {
  it('aggregates mapped floors, zones, area, and render metadata', () => {
    const stats = resolveMappingBuildingPickerStats(
      'b1',
      [
        floor({ id: 'f1', hasBuildingPolygon: true }),
        floor({ id: 'f2', buildingId: 'b2' }),
      ],
      [canvas({ id: 'c1', contextId: 'b1', hotspotCount: 5 })],
      [apartment({ id: 'a1', areaTotal: '60' }), apartment({ id: 'a2', areaTotal: '50' })],
    );

    expect(stats).toEqual({
      floorsMapped: 1,
      totalAreaSqm: 110,
      zones: 5,
      updatedAt: '2026-08-22T10:00:00.000Z',
      renderUrl: 'https://cdn.example/render.jpg',
    });
  });
});
