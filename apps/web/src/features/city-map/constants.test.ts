import { describe, expect, it } from 'vitest';

import { filterCityMapPlacementsByQuery, toAdminModelPose, toPublicModelPose } from './constants';

describe('city-map constants helpers', () => {
  it('filters placements by address/name query', () => {
    const items = [
      {
        buildingName: 'Avan Tower',
        projectName: 'Avan',
        projectAddress: 'Avan 12',
        projectCity: 'Yerevan',
      },
      {
        buildingName: 'Kentron Loft',
        projectName: 'Kentron',
        projectAddress: 'Abovyan 1',
        projectCity: 'Yerevan',
      },
    ];
    expect(filterCityMapPlacementsByQuery(items, 'abovyan')).toHaveLength(1);
    expect(filterCityMapPlacementsByQuery(items, 'YEREVAN')).toHaveLength(2);
    expect(filterCityMapPlacementsByQuery(items, '')).toHaveLength(2);
  });

  it('maps admin pose with publication status', () => {
    const pose = toAdminModelPose({
      id: '1',
      buildingId: 'b',
      projectId: 'p',
      glbMediaAssetId: 'm',
      glbUrl: 'https://cdn.example.com/a.glb',
      longitude: 44.5,
      latitude: 40.1,
      altitude: 0,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0,
      scale: 1,
      minZoom: 13,
      publicationStatus: 'draft',
      labelOverride: null,
      buildingName: 'B1',
      buildingDisplayOrder: 0,
      projectName: 'P1',
      projectAddress: null,
      projectCity: null,
      createdAt: '2026-07-31T00:00:00.000Z',
      updatedAt: '2026-07-31T00:00:00.000Z',
    });
    expect(pose.publicationStatus).toBe('draft');
    expect(pose.label).toBe('B1');
  });

  it('maps public pose as published', () => {
    const pose = toPublicModelPose({
      id: '1',
      buildingId: 'b',
      projectId: 'p',
      glbUrl: 'https://cdn.example.com/a.glb',
      longitude: 44.5,
      latitude: 40.1,
      altitude: 0,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0,
      scale: 1,
      minZoom: 13,
      label: 'B1',
      buildingName: 'B1',
      projectName: 'P1',
      address: null,
      city: null,
    });
    expect(pose.publicationStatus).toBe('published');
  });
});
