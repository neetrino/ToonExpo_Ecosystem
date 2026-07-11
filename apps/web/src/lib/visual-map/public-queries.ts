import type { PublicCanvas, PublicHotspot } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

export type PublicCanvasContext =
  { projectId: string } | { buildingId: string } | { floorId: string };

const HOTSPOT_PUBLIC_SELECT = {
  id: true,
  x: true,
  y: true,
  label: true,
  buildingId: true,
  floorId: true,
  apartmentId: true,
  building: { select: { id: true, name: true } },
  floor: {
    select: {
      id: true,
      name: true,
      level: true,
      buildingId: true,
    },
  },
  apartment: {
    select: {
      id: true,
      code: true,
      status: true,
      floorId: true,
      floor: { select: { buildingId: true } },
    },
  },
} as const;

const PROJECT_META_SELECT = {
  id: true,
  slug: true,
  company: { select: { slug: true } },
} as const;

function mapPublicHotspot(row: {
  id: string;
  x: number;
  y: number;
  label: string | null;
  building: { id: string; name: string } | null;
  floor: { id: string; name: string; level: number; buildingId: string } | null;
  apartment: {
    id: string;
    code: string;
    status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
    floorId: string;
    floor: { buildingId: string };
  } | null;
}): PublicHotspot | null {
  if (row.building) {
    return {
      id: row.id,
      x: row.x,
      y: row.y,
      label: row.label,
      target: { type: 'building', buildingId: row.building.id, name: row.building.name },
    };
  }
  if (row.floor) {
    return {
      id: row.id,
      x: row.x,
      y: row.y,
      label: row.label,
      target: {
        type: 'floor',
        floorId: row.floor.id,
        buildingId: row.floor.buildingId,
        name: row.floor.name,
        level: row.floor.level,
      },
    };
  }
  if (row.apartment) {
    return {
      id: row.id,
      x: row.x,
      y: row.y,
      label: row.label,
      target: {
        type: 'apartment',
        apartmentId: row.apartment.id,
        floorId: row.apartment.floorId,
        buildingId: row.apartment.floor.buildingId,
        code: row.apartment.code,
        status: row.apartment.status,
      },
    };
  }
  return null;
}

type ProjectMeta = {
  projectId: string;
  projectSlug: string;
  companySlug: string;
  contextType: 'project' | 'building' | 'floor';
};

/**
 * Returns a published canvas for a context only when the owning project is PUBLISHED.
 */
export async function getPublishedCanvasForContext(
  context: PublicCanvasContext,
): Promise<PublicCanvas | null> {
  const published = { status: 'PUBLISHED' as const };

  if ('projectId' in context) {
    const row = await prisma.visualCanvas.findFirst({
      where: {
        projectId: context.projectId,
        status: 'PUBLISHED',
        project: published,
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        imageAlt: true,
        projectId: true,
        buildingId: true,
        floorId: true,
        project: { select: PROJECT_META_SELECT },
        hotspots: {
          select: HOTSPOT_PUBLIC_SELECT,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
    if (!row?.project) {
      return null;
    }
    return toPublicCanvas(row, {
      projectId: row.project.id,
      projectSlug: row.project.slug,
      companySlug: row.project.company.slug,
      contextType: 'project',
    });
  }

  if ('buildingId' in context) {
    const row = await prisma.visualCanvas.findFirst({
      where: {
        buildingId: context.buildingId,
        status: 'PUBLISHED',
        building: { project: published },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        imageAlt: true,
        projectId: true,
        buildingId: true,
        floorId: true,
        building: { select: { project: { select: PROJECT_META_SELECT } } },
        hotspots: {
          select: HOTSPOT_PUBLIC_SELECT,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
    if (!row?.building) {
      return null;
    }
    return toPublicCanvas(row, {
      projectId: row.building.project.id,
      projectSlug: row.building.project.slug,
      companySlug: row.building.project.company.slug,
      contextType: 'building',
    });
  }

  const row = await prisma.visualCanvas.findFirst({
    where: {
      floorId: context.floorId,
      status: 'PUBLISHED',
      floor: { building: { project: published } },
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      imageAlt: true,
      projectId: true,
      buildingId: true,
      floorId: true,
      floor: {
        select: {
          building: { select: { project: { select: PROJECT_META_SELECT } } },
        },
      },
      hotspots: {
        select: HOTSPOT_PUBLIC_SELECT,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });
  if (!row?.floor) {
    return null;
  }
  return toPublicCanvas(row, {
    projectId: row.floor.building.project.id,
    projectSlug: row.floor.building.project.slug,
    companySlug: row.floor.building.project.company.slug,
    contextType: 'floor',
  });
}

function toPublicCanvas(
  row: {
    id: string;
    title: string | null;
    imageUrl: string;
    imageAlt: string | null;
    buildingId: string | null;
    floorId: string | null;
    hotspots: Parameters<typeof mapPublicHotspot>[0][];
  },
  meta: ProjectMeta,
): PublicCanvas {
  const hotspots = row.hotspots
    .map(mapPublicHotspot)
    .filter((hotspot): hotspot is PublicHotspot => hotspot !== null);

  return {
    id: row.id,
    title: row.title,
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
    contextType: meta.contextType,
    projectId: meta.projectId,
    buildingId: row.buildingId,
    floorId: row.floorId,
    companySlug: meta.companySlug,
    projectSlug: meta.projectSlug,
    hotspots,
  };
}
