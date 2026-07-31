import { describe, expect, it } from 'vitest';
import { PublicationStatus } from '@toonexpo/db';

import { toCityMapPlacementItem, toPublicCityMapPlacement } from './city-map.mappers.js';
import { resolvePublicCityMapConfig } from './city-map-public-config.js';
import { AdminCityMapController } from './admin-city-map.controller.js';
import { PublicCityMapController } from './public-city-map.controller.js';
import { Reflector } from '@nestjs/core';
import { ACCOUNT_TYPES_KEY } from '../auth/decorators/account-types.decorator.js';
import { IS_PUBLIC_KEY } from '../auth/decorators/public.decorator.js';

const sampleRow = {
  id: 'pl1',
  buildingId: 'b1',
  projectId: 'p1',
  glbMediaAssetId: 'm1',
  longitude: { toNumber: () => 44.52 },
  latitude: { toNumber: () => 40.18 },
  altitude: 2,
  rotationX: 90,
  rotationY: 10,
  rotationZ: 5,
  scale: 1.5,
  minZoom: 14,
  publicationStatus: PublicationStatus.published,
  labelOverride: '  Custom Label  ',
  createdAt: new Date('2026-07-31T12:00:00.000Z'),
  updatedAt: new Date('2026-07-31T13:00:00.000Z'),
  building: { name: 'Building A', displayOrder: 2 },
  project: { name: 'Project P', address: 'Abovyan 1', city: 'Yerevan' },
  glbMediaAsset: { fileUrl: 'https://cdn.example.com/a.glb' },
};

describe('city-map.mappers', () => {
  it('maps admin placement item with decimal coords and ISO dates', () => {
    const item = toCityMapPlacementItem(sampleRow as never);
    expect(item.longitude).toBe(44.52);
    expect(item.latitude).toBe(40.18);
    expect(item.buildingName).toBe('Building A');
    expect(item.glbUrl).toBe('https://cdn.example.com/a.glb');
    expect(item.createdAt).toBe('2026-07-31T12:00:00.000Z');
  });

  it('maps public placement label from override', () => {
    const item = toPublicCityMapPlacement(sampleRow as never);
    expect(item.label).toBe('Custom Label');
    expect(item.address).toBe('Abovyan 1');
    expect(item.city).toBe('Yerevan');
  });

  it('falls back to building name when override empty', () => {
    const item = toPublicCityMapPlacement({
      ...sampleRow,
      labelOverride: '   ',
    } as never);
    expect(item.label).toBe('Building A');
  });
});

describe('resolvePublicCityMapConfig', () => {
  it('returns Yerevan defaults', () => {
    const config = resolvePublicCityMapConfig();
    expect(config.styleUrl).toContain('openfreemap');
    expect(config.centerLng).toBeCloseTo(44.5152);
    expect(config.centerLat).toBeCloseTo(40.1872);
    expect(config.initialZoom).toBe(14);
  });
});

describe('CityMap controllers auth metadata', () => {
  it('admin controller requires platform_admin', () => {
    const reflector = new Reflector();
    const accountTypes = reflector.get<string[]>(ACCOUNT_TYPES_KEY, AdminCityMapController);
    expect(accountTypes).toEqual(['platform_admin']);
  });

  it('public placements endpoint is @Public', () => {
    const reflector = new Reflector();
    const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, PublicCityMapController.prototype.list);
    expect(isPublic).toBe(true);
  });
});
