import { describe, expect, it } from 'vitest';

import {
  filterCityMapPlacementsByQuery,
  isCityMapProjectPinId,
  mergeHomeMapPoses,
  mergeMapPosesWithProjectPins,
  parseCityMapProjectPinId,
  toAdminModelPose,
  toProjectPinPose,
  toPublicModelPose,
} from './constants';

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

  it('builds project pin and merges without duplicating placement projects', () => {
    const pin = toProjectPinPose({
      id: 'p1',
      name: 'Ajapnyak Terrace',
      latitude: '40.198',
      longitude: '44.468',
    });
    expect(pin?.id).toBe('project:p1');
    expect(pin?.glbUrl).toBe('');

    const availability = {
      total: 1,
      available: 1,
      reserved: 0,
      sold: 0,
    };
    const merged = mergeHomeMapPoses(
      [
        {
          id: 'p1',
          name: 'Ajapnyak Terrace',
          slug: 'ajapnyak',
          shortDescription: null,
          locationText: null,
          address: null,
          city: 'Yerevan',
          district: 'Ajapnyak',
          latitude: '40.198',
          longitude: '44.468',
          cover: null,
          builder: { id: 'c', name: 'B', logoUrl: null },
          availability,
          minPrice: null,
          maxPrice: null,
          priceCurrency: null,
        },
        {
          id: 'p2',
          name: 'Arabkir Park',
          slug: 'arabkir',
          shortDescription: null,
          locationText: null,
          address: null,
          city: 'Yerevan',
          district: 'Arabkir',
          latitude: '40.205',
          longitude: '44.52',
          cover: null,
          builder: { id: 'c', name: 'B', logoUrl: null },
          availability,
          minPrice: null,
          maxPrice: null,
          priceCurrency: null,
        },
      ],
      [
        {
          id: 'pl1',
          buildingId: 'b1',
          projectId: 'p1',
          glbUrl: 'https://cdn.example.com/a.glb',
          longitude: 44.47,
          latitude: 40.2,
          altitude: 0,
          rotationX: 90,
          rotationY: 0,
          rotationZ: 0,
          scale: 1,
          minZoom: 13,
          label: 'B1',
          buildingName: 'B1',
          projectName: 'Ajapnyak Terrace',
          address: null,
          city: null,
        },
      ],
    );
    expect(merged).toHaveLength(2);
    expect(merged.some((item) => item.id === 'pl1')).toBe(true);
    expect(merged.some((item) => item.id === 'project:p2')).toBe(true);
  });

  it('parses project pin ids and merges admin placement poses', () => {
    expect(isCityMapProjectPinId('project:p1')).toBe(true);
    expect(parseCityMapProjectPinId('project:p1')).toBe('p1');
    expect(parseCityMapProjectPinId('pl1')).toBeNull();

    const availability = {
      total: 1,
      available: 1,
      reserved: 0,
      sold: 0,
    };
    const merged = mergeMapPosesWithProjectPins(
      [
        {
          id: 'p2',
          name: 'Arabkir Park',
          slug: 'arabkir',
          shortDescription: null,
          locationText: null,
          address: null,
          city: 'Yerevan',
          district: 'Arabkir',
          latitude: '40.205',
          longitude: '44.52',
          cover: null,
          builder: { id: 'c', name: 'B', logoUrl: null },
          availability,
          minPrice: null,
          maxPrice: null,
          priceCurrency: null,
        },
      ],
      [
        {
          id: 'pl1',
          projectId: 'p1',
          buildingId: 'b1',
          glbUrl: 'https://cdn.example.com/a.glb',
          longitude: 44.47,
          latitude: 40.2,
          altitude: 0,
          rotationX: 90,
          rotationY: 0,
          rotationZ: 0,
          scale: 1,
          minZoom: 13,
          label: 'B1',
          publicationStatus: 'draft',
        },
      ],
    );
    expect(merged).toHaveLength(2);
    expect(merged.some((item) => item.id === 'project:p2')).toBe(true);
  });
});
