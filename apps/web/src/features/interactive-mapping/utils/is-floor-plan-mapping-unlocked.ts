import type { InteractiveMappingFloorSummary } from '@toonexpo/contracts';

/**
 * Floor plan mapping is available when the building polygon exists,
 * or when a floor plan was already uploaded (grandfather existing work).
 */
export const isFloorPlanMappingUnlocked = (floor: InteractiveMappingFloorSummary): boolean =>
  floor.hasBuildingPolygon || floor.hasFloorPlan;
