import { prisma } from '@toonexpo/db';

import { findOwnedCanvas } from './canvas-ownership';

export type BuilderCanvasSummary = {
  id: string;
  title: string | null;
  imageUrl: string;
  imageAlt: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  projectId: string | null;
  buildingId: string | null;
  floorId: string | null;
  hotspotCount: number;
  updatedAt: Date;
};

export type BuilderCanvasDetail = BuilderCanvasSummary & {
  hotspots: Array<{
    id: string;
    x: number;
    y: number;
    label: string | null;
    sortOrder: number;
    buildingId: string | null;
    floorId: string | null;
    apartmentId: string | null;
  }>;
};

export async function listCanvasesForProject(
  companyId: string,
  projectId: string,
): Promise<BuilderCanvasSummary[]> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, companyId },
    select: { id: true },
  });
  if (!project) {
    return [];
  }

  const rows = await prisma.visualCanvas.findMany({
    where: {
      OR: [{ projectId }, { building: { projectId } }, { floor: { building: { projectId } } }],
    },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      imageAlt: true,
      status: true,
      projectId: true,
      buildingId: true,
      floorId: true,
      updatedAt: true,
      _count: { select: { hotspots: { where: { archivedAt: null } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
    status: row.status,
    projectId: row.projectId,
    buildingId: row.buildingId,
    floorId: row.floorId,
    hotspotCount: row._count.hotspots,
    updatedAt: row.updatedAt,
  }));
}

export async function getCanvasForEdit(
  companyId: string,
  canvasId: string,
): Promise<BuilderCanvasDetail | null> {
  const owned = await findOwnedCanvas(prisma, companyId, canvasId);
  if (!owned) {
    return null;
  }

  const row = await prisma.visualCanvas.findFirst({
    where: { id: canvasId },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      imageAlt: true,
      status: true,
      projectId: true,
      buildingId: true,
      floorId: true,
      updatedAt: true,
      hotspots: {
        where: { archivedAt: null },
        select: {
          id: true,
          x: true,
          y: true,
          label: true,
          sortOrder: true,
          buildingId: true,
          floorId: true,
          apartmentId: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
    status: row.status,
    projectId: row.projectId,
    buildingId: row.buildingId,
    floorId: row.floorId,
    hotspotCount: row.hotspots.length,
    updatedAt: row.updatedAt,
    hotspots: row.hotspots,
  };
}

export type BuilderArchivedHotspot = {
  id: string;
  x: number;
  y: number;
  label: string | null;
  archivedAt: Date;
};

export async function listArchivedHotspotsForCanvas(
  companyId: string,
  canvasId: string,
): Promise<BuilderArchivedHotspot[]> {
  const owned = await findOwnedCanvas(prisma, companyId, canvasId);
  if (!owned) {
    return [];
  }

  const rows = await prisma.hotspot.findMany({
    where: { canvasId, archivedAt: { not: null } },
    select: {
      id: true,
      x: true,
      y: true,
      label: true,
      archivedAt: true,
    },
    orderBy: [{ archivedAt: 'desc' }],
  });

  return rows.map((row) => ({
    id: row.id,
    x: row.x,
    y: row.y,
    label: row.label,
    archivedAt: row.archivedAt as Date,
  }));
}

export { getPublishedCanvasForContext, type PublicCanvasContext } from './public-queries';
