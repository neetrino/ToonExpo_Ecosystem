import type { AdminGeoMapModelItem, AdminProjectListItem } from '@toonexpo/contracts';
import { describe, expect, it } from 'vitest';

import {
  buildGeoMapProjectOptions,
  collectTakenProjectIds,
} from '@/features/geo-map/admin/utils/available-projects';

const project = (id: string, name: string): AdminProjectListItem => ({
  id,
  name,
  publicationStatus: 'published',
  createdAt: '2026-07-31T00:00:00.000Z',
  city: null,
  builderCompanyId: 'co_1',
  companyName: 'Acme',
  buildingCover: null,
  buildingsCount: 0,
  apartmentsCount: 0,
});

const model = (projectId: string | null): AdminGeoMapModelItem => ({
  id: `model_${projectId ?? 'free'}`,
  projectId,
  projectName: projectId ? 'X' : null,
  projectSlug: projectId ? 'x' : null,
  mediaAssetId: 'media_1',
  mediaTitle: 'x.glb',
  modelUrl: 'https://cdn.example/x.glb',
  sourceOsmId: null,
  longitude: '44.5',
  latitude: '40.1',
  altitudeM: '0',
  headingDeg: '0',
  pitchDeg: '0',
  rollDeg: '0',
  scale: '1',
  minZoom: '14',
  isPublished: false,
  createdByUserId: 'user_1',
  updatedByUserId: null,
  createdAt: '2026-07-31T00:00:00.000Z',
  updatedAt: '2026-07-31T00:00:00.000Z',
});

describe('buildGeoMapProjectOptions', () => {
  it('flags projects that already have a map model', () => {
    const options = buildGeoMapProjectOptions(
      [project('p1', 'One'), project('p2', 'Two')],
      [model('p1'), model(null)],
    );
    expect(options).toEqual([
      { id: 'p1', name: 'One', companyName: 'Acme', hasModel: true },
      { id: 'p2', name: 'Two', companyName: 'Acme', hasModel: false },
    ]);
  });
});

describe('collectTakenProjectIds', () => {
  it('returns a set of project ids with models and ignores unassigned', () => {
    expect([...collectTakenProjectIds([model('p1'), model(null), model('p2')])].sort()).toEqual([
      'p1',
      'p2',
    ]);
  });
});
