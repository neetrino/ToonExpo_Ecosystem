import type {
  InteractiveMappingPhaseId,
  InteractiveMappingPhaseProgress,
  InteractiveMappingPhaseStatus,
} from '@toonexpo/contracts';

export type PhaseInput = {
  districtCount: number;
  hasMasterplanCanvas: boolean;
  hasDistrictHotspot: boolean;
  districtsWithPlanAndBuildingHotspot: number;
  buildingsWithFloorsMapped: number;
  buildingCount: number;
  floorsWithApartmentMapped: number;
  floorCount: number;
};

export type PhaseProgressResult = {
  phases: InteractiveMappingPhaseProgress[];
  activePhase: InteractiveMappingPhaseId | null;
};

export type CanvasSnapshot = {
  contextType: 'project' | 'district' | 'building' | 'floor';
  contextId: string;
  hasMedia: boolean;
  hotspotTargetTypes: readonly string[];
};

export type ProjectEntitiesSnapshot = {
  districtIds: readonly string[];
  buildings: readonly { id: string; floorsCount: number | null }[];
  floorIds: readonly string[];
  canvases: readonly CanvasSnapshot[];
};

const PHASE_TITLE_KEYS: Record<InteractiveMappingPhaseId, string> = {
  1: 'interactiveMapping.phase.masterplan',
  2: 'interactiveMapping.phase.districts',
  3: 'interactiveMapping.phase.buildings',
  4: 'interactiveMapping.phase.floors',
};

const PHASE_IDS: InteractiveMappingPhaseId[] = [1, 2, 3, 4];

/**
 * Phase 1 done when the project has ≥1 district, a masterplan canvas with media,
 * and ≥1 district hotspot.
 */
export const isPhase1Done = (input: PhaseInput): boolean =>
  input.districtCount >= 1 && input.hasMasterplanCanvas && input.hasDistrictHotspot;

/**
 * Phase 2 done when ≥1 district has a plan canvas plus a building hotspot.
 */
export const isPhase2Done = (input: PhaseInput): boolean =>
  input.districtCount >= 1 && input.districtsWithPlanAndBuildingHotspot >= 1;

/**
 * Phase 3 done when ≥1 building has floors mapped (floorsCount + canvas + floor hotspot).
 */
export const isPhase3Done = (input: PhaseInput): boolean => input.buildingsWithFloorsMapped >= 1;

/**
 * Phase 4 done when ≥1 floor has an apartment hotspot mapped.
 */
export const isPhase4Done = (input: PhaseInput): boolean => input.floorsWithApartmentMapped >= 1;

const PHASE_DONE_CHECKS: Record<InteractiveMappingPhaseId, (input: PhaseInput) => boolean> = {
  1: isPhase1Done,
  2: isPhase2Done,
  3: isPhase3Done,
  4: isPhase4Done,
};

/**
 * Computes phase statuses: first incomplete is active; later phases are locked.
 * When all four are done, activePhase is null.
 */
export const computePhaseProgress = (input: PhaseInput): PhaseProgressResult => {
  const doneFlags = PHASE_IDS.map((phase) => {
    const check = PHASE_DONE_CHECKS[phase];
    return check(input);
  });
  const firstIncompleteIndex = doneFlags.findIndex((done) => !done);
  const activePhase: InteractiveMappingPhaseId | null =
    firstIncompleteIndex === -1 ? null : PHASE_IDS[firstIncompleteIndex]!;

  const phases: InteractiveMappingPhaseProgress[] = PHASE_IDS.map((phase, index) => {
    let status: InteractiveMappingPhaseStatus;
    if (doneFlags[index]) {
      status = 'done';
    } else if (activePhase === phase) {
      status = 'active';
    } else {
      status = 'locked';
    }
    return {
      phase,
      status,
      titleKey: PHASE_TITLE_KEYS[phase],
    };
  });

  return { phases, activePhase };
};

const canvasHasTarget = (canvas: CanvasSnapshot, targetType: string): boolean =>
  canvas.hotspotTargetTypes.includes(targetType);

/**
 * Builds PhaseInput counts from project entity + canvas snapshots.
 */
export const buildPhaseInput = (snapshot: ProjectEntitiesSnapshot): PhaseInput => {
  const districtIdSet = new Set(snapshot.districtIds);
  const projectCanvases = snapshot.canvases.filter((c) => c.contextType === 'project');
  const hasMasterplanCanvas = projectCanvases.some((c) => c.hasMedia);
  const hasDistrictHotspot = projectCanvases.some((c) => canvasHasTarget(c, 'district'));

  let districtsWithPlanAndBuildingHotspot = 0;
  for (const districtId of districtIdSet) {
    const districtCanvases = snapshot.canvases.filter(
      (c) => c.contextType === 'district' && c.contextId === districtId && c.hasMedia,
    );
    if (districtCanvases.some((c) => canvasHasTarget(c, 'building'))) {
      districtsWithPlanAndBuildingHotspot += 1;
    }
  }

  let buildingsWithFloorsMapped = 0;
  for (const building of snapshot.buildings) {
    if (building.floorsCount == null || building.floorsCount <= 0) {
      continue;
    }
    const buildingCanvases = snapshot.canvases.filter(
      (c) => c.contextType === 'building' && c.contextId === building.id && c.hasMedia,
    );
    if (buildingCanvases.some((c) => canvasHasTarget(c, 'floor'))) {
      buildingsWithFloorsMapped += 1;
    }
  }

  let floorsWithApartmentMapped = 0;
  for (const floorId of snapshot.floorIds) {
    const floorCanvases = snapshot.canvases.filter(
      (c) => c.contextType === 'floor' && c.contextId === floorId && c.hasMedia,
    );
    if (floorCanvases.some((c) => canvasHasTarget(c, 'apartment'))) {
      floorsWithApartmentMapped += 1;
    }
  }

  return {
    districtCount: snapshot.districtIds.length,
    hasMasterplanCanvas,
    hasDistrictHotspot,
    districtsWithPlanAndBuildingHotspot,
    buildingsWithFloorsMapped,
    buildingCount: snapshot.buildings.length,
    floorsWithApartmentMapped,
    floorCount: snapshot.floorIds.length,
  };
};
