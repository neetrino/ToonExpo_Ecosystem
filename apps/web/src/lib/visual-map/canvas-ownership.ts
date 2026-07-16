import type { PrismaClient } from '@toonexpo/db';

export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export type CanvasContextType = 'project' | 'building' | 'floor';

export type OwnedCanvas = {
  id: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  projectId: string | null;
  buildingId: string | null;
  floorId: string | null;
  contextType: CanvasContextType;
  owningProjectId: string;
};

type CanvasRow = {
  id: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  projectId: string | null;
  buildingId: string | null;
  floorId: string | null;
  project: { id: string; companyId: string } | null;
  building: { id: string; project: { id: string; companyId: string } } | null;
  floor: {
    id: string;
    building: { id: string; project: { id: string; companyId: string } };
  } | null;
};

const CANVAS_OWNERSHIP_SELECT = {
  id: true,
  status: true,
  projectId: true,
  buildingId: true,
  floorId: true,
  project: { select: { id: true, companyId: true } },
  building: {
    select: { id: true, project: { select: { id: true, companyId: true } } },
  },
  floor: {
    select: {
      id: true,
      building: {
        select: { id: true, project: { select: { id: true, companyId: true } } },
      },
    },
  },
} as const;

function mapOwnedCanvas(row: CanvasRow, companyId: string): OwnedCanvas | null {
  if (row.project) {
    if (row.project.companyId !== companyId) {
      return null;
    }
    return {
      id: row.id,
      status: row.status,
      projectId: row.projectId,
      buildingId: row.buildingId,
      floorId: row.floorId,
      contextType: 'project',
      owningProjectId: row.project.id,
    };
  }

  if (row.building) {
    if (row.building.project.companyId !== companyId) {
      return null;
    }
    return {
      id: row.id,
      status: row.status,
      projectId: row.projectId,
      buildingId: row.buildingId,
      floorId: row.floorId,
      contextType: 'building',
      owningProjectId: row.building.project.id,
    };
  }

  if (row.floor) {
    if (row.floor.building.project.companyId !== companyId) {
      return null;
    }
    return {
      id: row.id,
      status: row.status,
      projectId: row.projectId,
      buildingId: row.buildingId,
      floorId: row.floorId,
      contextType: 'floor',
      owningProjectId: row.floor.building.project.id,
    };
  }

  return null;
}

export async function findOwnedCanvas(
  tx: TransactionClient,
  companyId: string,
  canvasId: string,
): Promise<OwnedCanvas | null> {
  const row = await tx.visualCanvas.findFirst({
    where: { id: canvasId },
    select: CANVAS_OWNERSHIP_SELECT,
  });
  if (!row) {
    return null;
  }
  return mapOwnedCanvas(row, companyId);
}

export async function resolveContextOwnership(
  tx: TransactionClient,
  companyId: string,
  context: { projectId?: string; buildingId?: string; floorId?: string },
): Promise<{ owningProjectId: string } | null> {
  if (context.projectId) {
    const project = await tx.project.findFirst({
      where: { id: context.projectId, companyId },
      select: { id: true },
    });
    return project ? { owningProjectId: project.id } : null;
  }

  if (context.buildingId) {
    const building = await tx.building.findFirst({
      where: { id: context.buildingId, project: { companyId } },
      select: { projectId: true },
    });
    return building ? { owningProjectId: building.projectId } : null;
  }

  if (context.floorId) {
    const floor = await tx.floor.findFirst({
      where: { id: context.floorId, building: { project: { companyId } } },
      select: { building: { select: { projectId: true } } },
    });
    return floor ? { owningProjectId: floor.building.projectId } : null;
  }

  return null;
}
