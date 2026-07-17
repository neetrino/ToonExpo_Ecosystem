import { Injectable } from '@nestjs/common';
import type { PublicCanvas, PublicHotspot } from '@toonexpo/contracts';

import { PrismaService } from '../../common/prisma.service';

const hotspotSelect = {
  id: true,
  x: true,
  y: true,
  label: true,
  building: { select: { id: true, name: true, status: true } },
  floor: {
    select: {
      id: true,
      name: true,
      level: true,
      buildingId: true,
      status: true,
      building: { select: { status: true } },
    },
  },
  apartment: {
    select: {
      id: true,
      code: true,
      status: true,
      floorId: true,
      floor: {
        select: {
          buildingId: true,
          status: true,
          building: { select: { status: true } },
        },
      },
    },
  },
} as const;

type HotspotRow = {
  id: string;
  x: number;
  y: number;
  label: string | null;
  building: { id: string; name: string; status: string } | null;
  floor: {
    id: string;
    name: string;
    level: number;
    buildingId: string;
    status: string;
    building: { status: string };
  } | null;
  apartment: {
    id: string;
    code: string;
    status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
    floorId: string;
    floor: { buildingId: string; status: string; building: { status: string } };
  } | null;
};

@Injectable()
export class VisualMapPublicService {
  constructor(private readonly prisma: PrismaService) {}

  async get(context: { projectId?: string; buildingId?: string; floorId?: string }) {
    if (context.projectId) {
      const row = await this.prisma.client.visualCanvas.findFirst({
        where: {
          projectId: context.projectId,
          status: 'PUBLISHED',
          project: { status: 'PUBLISHED' },
        },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          imageAlt: true,
          buildingId: true,
          floorId: true,
          project: { select: { id: true, slug: true, company: { select: { slug: true } } } },
          hotspots: {
            where: { archivedAt: null },
            select: hotspotSelect,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          },
        },
      });
      return row?.project
        ? this.map(row, row.project.id, row.project.slug, row.project.company.slug, 'project')
        : null;
    }
    if (context.buildingId) {
      const row = await this.prisma.client.visualCanvas.findFirst({
        where: {
          buildingId: context.buildingId,
          status: 'PUBLISHED',
          building: { status: 'PUBLISHED', project: { status: 'PUBLISHED' } },
        },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          imageAlt: true,
          buildingId: true,
          floorId: true,
          building: {
            select: {
              project: {
                select: { id: true, slug: true, company: { select: { slug: true } } },
              },
            },
          },
          hotspots: {
            where: { archivedAt: null },
            select: hotspotSelect,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          },
        },
      });
      const project = row?.building?.project;
      return row && project
        ? this.map(row, project.id, project.slug, project.company.slug, 'building')
        : null;
    }
    if (!context.floorId) {
      return null;
    }
    const row = await this.prisma.client.visualCanvas.findFirst({
      where: {
        floorId: context.floorId,
        status: 'PUBLISHED',
        floor: {
          status: 'PUBLISHED',
          building: { status: 'PUBLISHED', project: { status: 'PUBLISHED' } },
        },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        imageAlt: true,
        buildingId: true,
        floorId: true,
        floor: {
          select: {
            building: {
              select: {
                project: {
                  select: { id: true, slug: true, company: { select: { slug: true } } },
                },
              },
            },
          },
        },
        hotspots: {
          where: { archivedAt: null },
          select: hotspotSelect,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
    const project = row?.floor?.building.project;
    return row && project
      ? this.map(row, project.id, project.slug, project.company.slug, 'floor')
      : null;
  }

  private map(
    row: {
      id: string;
      title: string | null;
      imageUrl: string;
      imageAlt: string | null;
      buildingId: string | null;
      floorId: string | null;
      hotspots: HotspotRow[];
    },
    projectId: string,
    projectSlug: string,
    companySlug: string,
    contextType: 'project' | 'building' | 'floor',
  ): PublicCanvas {
    return {
      id: row.id,
      title: row.title,
      imageUrl: row.imageUrl,
      imageAlt: row.imageAlt,
      buildingId: row.buildingId,
      floorId: row.floorId,
      projectId,
      projectSlug,
      companySlug,
      contextType,
      hotspots: row.hotspots
        .map(mapHotspot)
        .filter((hotspot): hotspot is PublicHotspot => hotspot !== null),
    };
  }
}

function mapHotspot(row: HotspotRow): PublicHotspot | null {
  if (row.building?.status === 'PUBLISHED') {
    return {
      id: row.id,
      x: row.x,
      y: row.y,
      label: row.label,
      target: { type: 'building', buildingId: row.building.id, name: row.building.name },
    };
  }
  if (row.floor?.status === 'PUBLISHED' && row.floor.building.status === 'PUBLISHED') {
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
  if (
    row.apartment &&
    row.apartment.floor.status === 'PUBLISHED' &&
    row.apartment.floor.building.status === 'PUBLISHED'
  ) {
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
