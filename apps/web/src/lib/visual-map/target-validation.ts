import type { CanvasContextType, TransactionClient } from './canvas-ownership';

export type HotspotTargetIds = {
  buildingId?: string;
  floorId?: string;
  apartmentId?: string;
};

/**
 * Validates hotspot target belongs to the canvas context hierarchy.
 * Project canvas → buildings of that project;
 * Building canvas → floors of that building;
 * Floor canvas → apartments of that floor.
 */
export async function validateHotspotTarget(
  tx: TransactionClient,
  companyId: string,
  canvas: {
    contextType: CanvasContextType;
    projectId: string | null;
    buildingId: string | null;
    floorId: string | null;
  },
  target: HotspotTargetIds,
): Promise<'ok' | 'notFound' | 'targetMismatch'> {
  if (canvas.contextType === 'project') {
    if (!target.buildingId || target.floorId || target.apartmentId || !canvas.projectId) {
      return 'targetMismatch';
    }
    const building = await tx.building.findFirst({
      where: { id: target.buildingId, project: { companyId } },
      select: { id: true, projectId: true },
    });
    if (!building) {
      return 'notFound';
    }
    return building.projectId === canvas.projectId ? 'ok' : 'targetMismatch';
  }

  if (canvas.contextType === 'building') {
    if (!target.floorId || target.buildingId || target.apartmentId || !canvas.buildingId) {
      return 'targetMismatch';
    }
    const floor = await tx.floor.findFirst({
      where: { id: target.floorId, building: { project: { companyId } } },
      select: { id: true, buildingId: true },
    });
    if (!floor) {
      return 'notFound';
    }
    return floor.buildingId === canvas.buildingId ? 'ok' : 'targetMismatch';
  }

  if (!target.apartmentId || target.buildingId || target.floorId || !canvas.floorId) {
    return 'targetMismatch';
  }
  const apartment = await tx.apartment.findFirst({
    where: { id: target.apartmentId, floor: { building: { project: { companyId } } } },
    select: { id: true, floorId: true },
  });
  if (!apartment) {
    return 'notFound';
  }
  return apartment.floorId === canvas.floorId ? 'ok' : 'targetMismatch';
}

export function targetData(target: HotspotTargetIds): {
  buildingId: string | null;
  floorId: string | null;
  apartmentId: string | null;
} {
  return {
    buildingId: target.buildingId ?? null,
    floorId: target.floorId ?? null,
    apartmentId: target.apartmentId ?? null,
  };
}
