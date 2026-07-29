import { describe, expect, it } from 'vitest';

import {
  buildPhaseInput,
  computePhaseProgress,
  isPhase1Done,
  isPhase2Done,
  isPhase3Done,
  isPhase4Done,
  type PhaseInput,
} from './phase-progress.js';

const emptyInput = (): PhaseInput => ({
  districtCount: 0,
  hasMasterplanCanvas: false,
  hasDistrictHotspot: false,
  districtsWithPlanAndBuildingHotspot: 0,
  buildingsWithFloorsMapped: 0,
  buildingCount: 0,
  floorsWithApartmentMapped: 0,
  floorCount: 0,
});

describe('phase done checks', () => {
  it('phase 1 requires district, masterplan canvas, and district hotspot', () => {
    expect(isPhase1Done(emptyInput())).toBe(false);
    expect(
      isPhase1Done({
        ...emptyInput(),
        districtCount: 1,
        hasMasterplanCanvas: true,
        hasDistrictHotspot: true,
      }),
    ).toBe(true);
  });

  it('phase 2 requires district count and plan+building hotspot district', () => {
    expect(
      isPhase2Done({
        ...emptyInput(),
        districtCount: 1,
        districtsWithPlanAndBuildingHotspot: 0,
      }),
    ).toBe(false);
    expect(
      isPhase2Done({
        ...emptyInput(),
        districtCount: 1,
        districtsWithPlanAndBuildingHotspot: 1,
      }),
    ).toBe(true);
  });

  it('phase 3 and 4 use >= 1 mapped entity', () => {
    expect(isPhase3Done({ ...emptyInput(), buildingsWithFloorsMapped: 1 })).toBe(true);
    expect(isPhase4Done({ ...emptyInput(), floorsWithApartmentMapped: 1 })).toBe(true);
  });
});

describe('computePhaseProgress', () => {
  it('starts with phase 1 active and the rest locked', () => {
    const result = computePhaseProgress(emptyInput());
    expect(result.activePhase).toBe(1);
    expect(result.phases.map((p) => p.status)).toEqual(['active', 'locked', 'locked', 'locked']);
  });

  it('advances active phase after each done transition', () => {
    const after1 = computePhaseProgress({
      ...emptyInput(),
      districtCount: 1,
      hasMasterplanCanvas: true,
      hasDistrictHotspot: true,
    });
    expect(after1.activePhase).toBe(2);
    expect(after1.phases.map((p) => p.status)).toEqual(['done', 'active', 'locked', 'locked']);

    const after2 = computePhaseProgress({
      ...emptyInput(),
      districtCount: 1,
      hasMasterplanCanvas: true,
      hasDistrictHotspot: true,
      districtsWithPlanAndBuildingHotspot: 1,
    });
    expect(after2.activePhase).toBe(3);
    expect(after2.phases.map((p) => p.status)).toEqual(['done', 'done', 'active', 'locked']);

    const after3 = computePhaseProgress({
      ...emptyInput(),
      districtCount: 1,
      hasMasterplanCanvas: true,
      hasDistrictHotspot: true,
      districtsWithPlanAndBuildingHotspot: 1,
      buildingsWithFloorsMapped: 1,
      buildingCount: 2,
    });
    expect(after3.activePhase).toBe(4);
    expect(after3.phases.map((p) => p.status)).toEqual(['done', 'done', 'done', 'active']);
  });

  it('returns null activePhase when all phases are done', () => {
    const result = computePhaseProgress({
      districtCount: 2,
      hasMasterplanCanvas: true,
      hasDistrictHotspot: true,
      districtsWithPlanAndBuildingHotspot: 1,
      buildingsWithFloorsMapped: 1,
      buildingCount: 3,
      floorsWithApartmentMapped: 1,
      floorCount: 10,
    });
    expect(result.activePhase).toBeNull();
    expect(result.phases.every((p) => p.status === 'done')).toBe(true);
  });
});

describe('buildPhaseInput', () => {
  it('aggregates canvas and hotspot signals into phase input', () => {
    const input = buildPhaseInput({
      districtIds: ['d1', 'd2'],
      buildings: [
        { id: 'b1', floorsCount: 5 },
        { id: 'b2', floorsCount: 0 },
      ],
      floorIds: ['f1', 'f2'],
      canvases: [
        {
          contextType: 'project',
          contextId: 'p1',
          hasMedia: true,
          hotspotTargetTypes: ['district'],
        },
        {
          contextType: 'district',
          contextId: 'd1',
          hasMedia: true,
          hotspotTargetTypes: ['building'],
        },
        {
          contextType: 'building',
          contextId: 'b1',
          hasMedia: true,
          hotspotTargetTypes: ['floor'],
        },
        {
          contextType: 'floor',
          contextId: 'f1',
          hasMedia: true,
          hotspotTargetTypes: ['apartment'],
        },
      ],
    });

    expect(input).toEqual({
      districtCount: 2,
      hasMasterplanCanvas: true,
      hasDistrictHotspot: true,
      districtsWithPlanAndBuildingHotspot: 1,
      buildingsWithFloorsMapped: 1,
      buildingCount: 2,
      floorsWithApartmentMapped: 1,
      floorCount: 2,
    });
  });
});
