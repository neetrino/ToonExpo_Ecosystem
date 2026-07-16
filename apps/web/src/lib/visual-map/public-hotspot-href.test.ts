import { describe, expect, it } from 'vitest';

import { buildPublicHotspotHref } from './public-hotspot-href';

describe('buildPublicHotspotHref', () => {
  it('links building targets to building anchors', () => {
    expect(buildPublicHotspotHref({ type: 'building', buildingId: 'b1', name: 'Tower A' })).toBe(
      '#building-b1',
    );
  });

  it('links floor targets to floor anchors', () => {
    expect(
      buildPublicHotspotHref({
        type: 'floor',
        floorId: 'f1',
        buildingId: 'b1',
        name: 'Floor 1',
        level: 1,
      }),
    ).toBe('#floor-f1');
  });

  it('links apartment targets to apartment anchors', () => {
    expect(
      buildPublicHotspotHref({
        type: 'apartment',
        apartmentId: 'a1',
        floorId: 'f1',
        buildingId: 'b1',
        code: '101',
        status: 'AVAILABLE',
      }),
    ).toBe('#apartment-a1');
  });
});
