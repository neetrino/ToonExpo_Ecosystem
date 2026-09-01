import type { AdminGeoMapModelItem, PublicGeoMapModelItem } from '@toonexpo/contracts';
import { describe, expect, it } from 'vitest';

import {
  mapAdminGeoMapItemToObject,
  mapAdminGeoMapItemsToObjects,
  mapPublicGeoMapItemToObject,
  mapPublicGeoMapItemsToObjects,
} from '@/features/geo-map/utils/map-object-mapper';

const adminItem: AdminGeoMapModelItem = {
  id: 'geomap_1',
  projectId: 'proj_1',
  projectName: 'Toon Towers',
  projectSlug: 'toon-towers',
  mediaAssetId: 'media_1',
  mediaTitle: 'toon-towers.glb',
  modelUrl: 'https://cdn.example/toon-towers.glb',
  sourceOsmId: '123',
  longitude: '44.5152000',
  latitude: '40.1872000',
  altitudeM: '2.5',
  headingDeg: '90',
  pitchDeg: '0',
  rollDeg: '0',
  scale: '1.5',
  minZoom: '14',
  isPublished: true,
  createdByUserId: 'user_1',
  updatedByUserId: null,
  createdAt: '2026-07-31T00:00:00.000Z',
  updatedAt: '2026-07-31T00:00:00.000Z',
};

const publicItem: PublicGeoMapModelItem = {
  id: 'pmm_1',
  projectId: 'proj_1',
  projectSlug: 'toon-towers',
  projectName: 'Toon Towers',
  logoUrl: 'https://cdn.example/logo.png',
  address: 'Baghramyan 26',
  city: 'Yerevan',
  district: 'Kentron',
  longitude: '44.5152000',
  latitude: '40.1872000',
  modelUrl: 'https://cdn.example/toon-towers.glb',
  sourceOsmId: '123',
  altitudeM: '2.5',
  headingDeg: '90',
  pitchDeg: '0',
  rollDeg: '0',
  scale: '1.5',
  minZoom: '14',
};

describe('mapAdminGeoMapItemToObject', () => {
  it('parses Decimal strings into numbers and keeps the record id', () => {
    expect(mapAdminGeoMapItemToObject(adminItem)).toEqual({
      id: 'geomap_1',
      projectId: 'proj_1',
      projectSlug: 'toon-towers',
      label: 'Toon Towers',
      logoUrl: null,
      addressLine: null,
      modelUrl: 'https://cdn.example/toon-towers.glb',
      sourceOsmId: '123',
      longitude: 44.5152,
      latitude: 40.1872,
      altitudeM: 2.5,
      headingDeg: 90,
      pitchDeg: 0,
      rollDeg: 0,
      scale: 1.5,
      minZoom: 14,
    });
  });

  it('falls back to media title for unassigned models', () => {
    expect(
      mapAdminGeoMapItemToObject({
        ...adminItem,
        projectId: null,
        projectName: null,
        projectSlug: null,
      }).label,
    ).toBe('toon-towers.glb');
  });

  it('maps a batch preserving order', () => {
    expect(mapAdminGeoMapItemsToObjects([adminItem]).map((item) => item.id)).toEqual(['geomap_1']);
  });
});

describe('mapPublicGeoMapItemToObject', () => {
  it('parses Decimal strings into numbers and uses the model id as the object id', () => {
    expect(mapPublicGeoMapItemToObject(publicItem)).toEqual({
      id: 'pmm_1',
      projectId: 'proj_1',
      projectSlug: 'toon-towers',
      label: 'Toon Towers',
      logoUrl: 'https://cdn.example/logo.png',
      addressLine: 'Baghramyan 26 · Yerevan',
      modelUrl: 'https://cdn.example/toon-towers.glb',
      sourceOsmId: '123',
      longitude: 44.5152,
      latitude: 40.1872,
      altitudeM: 2.5,
      headingDeg: 90,
      pitchDeg: 0,
      rollDeg: 0,
      scale: 1.5,
      minZoom: 14,
    });
  });

  it('maps unassigned published models with an empty label', () => {
    expect(
      mapPublicGeoMapItemToObject({
        ...publicItem,
        projectId: null,
        projectSlug: null,
        projectName: null,
        logoUrl: null,
        address: null,
        city: null,
        district: null,
      }),
    ).toEqual(
      expect.objectContaining({
        id: 'pmm_1',
        projectId: null,
        projectSlug: null,
        label: '',
        logoUrl: null,
        addressLine: null,
      }),
    );
  });

  it('maps a batch preserving order', () => {
    expect(mapPublicGeoMapItemsToObjects([publicItem]).map((item) => item.id)).toEqual(['pmm_1']);
  });
});
