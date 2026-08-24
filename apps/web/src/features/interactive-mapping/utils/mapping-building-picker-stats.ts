import type {
  InteractiveMappingApartmentSummary,
  InteractiveMappingCanvasSummary,
  InteractiveMappingFloorSummary,
} from '@toonexpo/contracts';

export type MappingBuildingPickerStats = {
  floorsMapped: number;
  totalAreaSqm: number;
  zones: number;
  updatedAt: string | null;
  renderUrl: string | null;
};

const sumApartmentArea = (apartments: InteractiveMappingApartmentSummary[]): number =>
  apartments.reduce((sum, apartment) => {
    if (!apartment.areaTotal) {
      return sum;
    }
    const parsed = Number(apartment.areaTotal);
    return Number.isFinite(parsed) ? sum + parsed : sum;
  }, 0);

/**
 * Aggregates floor-mapping progress and building-render metadata for picker cards.
 */
export const resolveMappingBuildingPickerStats = (
  buildingId: string,
  floors: InteractiveMappingFloorSummary[],
  canvases: InteractiveMappingCanvasSummary[],
  apartments: InteractiveMappingApartmentSummary[] = [],
): MappingBuildingPickerStats => {
  const buildingFloors = floors.filter((floor) => floor.buildingId === buildingId);
  const buildingCanvas = canvases.find(
    (canvas) => canvas.contextType === 'building' && canvas.contextId === buildingId,
  );
  const buildingApartments = apartments.filter((apartment) => apartment.buildingId === buildingId);

  return {
    floorsMapped: buildingFloors.filter((floor) => floor.hasBuildingPolygon).length,
    totalAreaSqm: sumApartmentArea(buildingApartments),
    zones: buildingCanvas?.hotspotCount ?? 0,
    updatedAt: buildingCanvas?.updatedAt ?? null,
    renderUrl: buildingCanvas?.mediaUrl ?? null,
  };
};
