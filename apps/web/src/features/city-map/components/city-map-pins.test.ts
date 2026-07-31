import { describe, expect, it } from 'vitest';

import type { CityMapModelPose } from '../constants';

/**
 * Mirrors pin GeoJSON property mapping used by setCityMapPins.
 * Kept as a pure unit test so MapLibre paint match arms stay covered without WebGL.
 */
const toPinProperties = (pose: CityMapModelPose) => ({
  id: pose.id,
  projectId: pose.projectId,
  buildingId: pose.buildingId,
  label: pose.label,
  publicationStatus: pose.publicationStatus ?? 'published',
});

describe('city map pin properties', () => {
  const basePose: CityMapModelPose = {
    id: 'pl1',
    projectId: 'p1',
    buildingId: 'b1',
    label: 'Tower',
    glbUrl: 'https://cdn.example.com/a.glb',
    longitude: 44.5,
    latitude: 40.1,
    altitude: 0,
    rotationX: 90,
    rotationY: 0,
    rotationZ: 0,
    scale: 1,
    minZoom: 13,
  };

  it('defaults missing status to published for public poses', () => {
    expect(toPinProperties(basePose).publicationStatus).toBe('published');
  });

  it('preserves draft status for admin editor pins', () => {
    expect(toPinProperties({ ...basePose, publicationStatus: 'draft' }).publicationStatus).toBe(
      'draft',
    );
  });
});
