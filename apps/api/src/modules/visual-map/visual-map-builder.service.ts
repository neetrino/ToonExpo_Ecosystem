import { Injectable } from '@nestjs/common';
import {
  canvasIdInputSchema,
  canvasStatusInputSchema,
  canvasUpsertInputSchema,
  hotspotIdInputSchema,
  hotspotMoveInputSchema,
  hotspotUpsertInputSchema,
} from '@toonexpo/contracts';
import type { Prisma } from '@toonexpo/db';

import { PrismaService } from '../../common/prisma.service';

type OwnedCanvas = {
  id: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  projectId: string | null;
  buildingId: string | null;
  floorId: string | null;
  projectOwnerId: string;
};

@Injectable()
export class VisualMapBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, companyId: string, projectId: string) {
    if (!(await this.isMember(userId, companyId))) return [];
    const project = await this.prisma.client.project.findFirst({
      where: { id: projectId, companyId },
    });
    if (!project) return [];
    const rows = await this.prisma.client.visualCanvas.findMany({
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
    return rows.map((row) => ({ ...row, hotspotCount: row._count.hotspots, _count: undefined }));
  }

  async detail(userId: string, companyId: string, canvasId: string) {
    if (!(await this.isMember(userId, companyId))) return null;
    const owned = await this.owned(this.prisma.client, companyId, canvasId);
    if (!owned) return null;
    const row = await this.prisma.client.visualCanvas.findUnique({
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
    return row ? { ...row, hotspotCount: row.hotspots.length } : null;
  }

  async archived(userId: string, companyId: string, canvasId: string) {
    if (!(await this.isMember(userId, companyId))) return [];
    if (!(await this.owned(this.prisma.client, companyId, canvasId))) return [];
    return this.prisma.client.hotspot.findMany({
      where: { canvasId, archivedAt: { not: null } },
      select: { id: true, x: true, y: true, label: true, archivedAt: true },
      orderBy: { archivedAt: 'desc' },
    });
  }

  async mutate(userId: string, companyId: string, action: string, raw: unknown) {
    if (!(await this.isMember(userId, companyId))) {
      return { ok: false as const, errorKey: 'unauthorized' as const };
    }
    if (action === 'create-canvas' || action === 'update-canvas') {
      return this.upsertCanvas(companyId, action === 'update-canvas', raw);
    }
    if (action === 'set-canvas-status') return this.setStatus(userId, companyId, raw);
    if (action === 'delete-canvas') return this.deleteCanvas(companyId, raw);
    if (action === 'create-hotspot' || action === 'update-hotspot') {
      return this.upsertHotspot(companyId, action === 'update-hotspot', raw);
    }
    if (action === 'move-hotspot') return this.moveHotspot(companyId, raw);
    if (action === 'archive-hotspot') return this.archiveHotspot(companyId, raw, false);
    if (action === 'restore-hotspot') return this.archiveHotspot(companyId, raw, true);
    return invalid();
  }

  private async upsertCanvas(companyId: string, update: boolean, raw: unknown) {
    const parsed = canvasUpsertInputSchema.safeParse(raw);
    if (!parsed.success || update !== Boolean(parsed.data.canvasId)) return invalid();
    const input = parsed.data;
    if (update && input.canvasId) {
      const owned = await this.owned(this.prisma.client, companyId, input.canvasId);
      if (!owned) return notFound();
      await this.prisma.client.visualCanvas.update({
        where: { id: owned.id },
        data: { title: input.title, imageUrl: input.imageUrl, imageAlt: input.imageAlt },
      });
      return { ok: true as const, canvasId: owned.id, projectId: owned.projectOwnerId };
    }
    const projectId = await this.contextProject(companyId, input);
    if (!projectId) return notFound();
    const canvas = await this.prisma.client.visualCanvas.create({
      data: {
        title: input.title,
        imageUrl: input.imageUrl,
        imageAlt: input.imageAlt,
        projectId: input.projectId,
        buildingId: input.buildingId,
        floorId: input.floorId,
      },
    });
    return { ok: true as const, canvasId: canvas.id, projectId };
  }

  private async setStatus(userId: string, companyId: string, raw: unknown) {
    const parsed = canvasStatusInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    return this.prisma.client.$transaction(async (tx) => {
      const owned = await this.owned(tx, companyId, parsed.data.canvasId);
      if (!owned) return notFound();
      await tx.visualCanvas.update({
        where: { id: owned.id },
        data: { status: parsed.data.status },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          actorRole: 'BUILDER',
          action: 'PUBLICATION_CHANGE',
          entityType: 'VISUAL_CANVAS',
          entityId: owned.id,
          companyId,
          detail: `${owned.status}→${parsed.data.status}`,
        },
      });
      return { ok: true as const, canvasId: owned.id, projectId: owned.projectOwnerId };
    });
  }

  private async deleteCanvas(companyId: string, raw: unknown) {
    const parsed = canvasIdInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    const owned = await this.owned(this.prisma.client, companyId, parsed.data.canvasId);
    if (!owned) return notFound();
    if (owned.status !== 'DRAFT') return invalid();
    await this.prisma.client.visualCanvas.delete({ where: { id: owned.id } });
    return { ok: true as const, canvasId: owned.id, projectId: owned.projectOwnerId };
  }

  private async upsertHotspot(companyId: string, update: boolean, raw: unknown) {
    const parsed = hotspotUpsertInputSchema.safeParse(raw);
    if (!parsed.success || update !== Boolean(parsed.data.hotspotId)) return invalid();
    return this.prisma.client.$transaction(async (tx) => {
      const input = parsed.data;
      const owned = await this.owned(tx, companyId, input.canvasId);
      if (!owned || !(await this.validTarget(tx, companyId, owned, input))) return notFound();
      if (update && input.hotspotId) {
        const current = await tx.hotspot.findFirst({
          where: { id: input.hotspotId, canvasId: owned.id, archivedAt: null },
        });
        if (!current) return notFound();
        await tx.hotspot.update({ where: { id: current.id }, data: hotspotData(input) });
        return { ok: true as const, hotspotId: current.id, projectId: owned.projectOwnerId };
      }
      const hotspot = await tx.hotspot.create({
        data: { canvasId: owned.id, ...hotspotData(input) },
      });
      return { ok: true as const, hotspotId: hotspot.id, projectId: owned.projectOwnerId };
    });
  }

  private async moveHotspot(companyId: string, raw: unknown) {
    const parsed = hotspotMoveInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    const hotspot = await this.prisma.client.hotspot.findFirst({
      where: { id: parsed.data.hotspotId, archivedAt: null },
    });
    if (!hotspot) return notFound();
    const owned = await this.owned(this.prisma.client, companyId, hotspot.canvasId);
    if (!owned) return notFound();
    await this.prisma.client.hotspot.update({
      where: { id: hotspot.id },
      data: { x: parsed.data.x, y: parsed.data.y },
    });
    return { ok: true as const, hotspotId: hotspot.id, projectId: owned.projectOwnerId };
  }

  private async archiveHotspot(companyId: string, raw: unknown, restore: boolean) {
    const parsed = hotspotIdInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    const hotspot = await this.prisma.client.hotspot.findFirst({
      where: { id: parsed.data.hotspotId, archivedAt: restore ? { not: null } : null },
    });
    if (!hotspot) return notFound();
    const owned = await this.owned(this.prisma.client, companyId, hotspot.canvasId);
    if (!owned) return notFound();
    if (!restore && owned.status === 'DRAFT') {
      await this.prisma.client.hotspot.delete({ where: { id: hotspot.id } });
    } else {
      await this.prisma.client.hotspot.update({
        where: { id: hotspot.id },
        data: { archivedAt: restore ? null : new Date() },
      });
    }
    return { ok: true as const, hotspotId: hotspot.id, projectId: owned.projectOwnerId };
  }

  private async isMember(userId: string, companyId: string): Promise<boolean> {
    return Boolean(
      await this.prisma.client.companyMember.findFirst({
        where: { userId, companyId, role: 'BUILDER' },
      }),
    );
  }

  private async contextProject(
    companyId: string,
    context: {
      projectId?: string;
      buildingId?: string;
      floorId?: string;
    },
  ): Promise<string | null> {
    if (context.projectId) {
      return (
        (
          await this.prisma.client.project.findFirst({
            where: { id: context.projectId, companyId },
          })
        )?.id ?? null
      );
    }
    if (context.buildingId) {
      return (
        (
          await this.prisma.client.building.findFirst({
            where: { id: context.buildingId, project: { companyId } },
          })
        )?.projectId ?? null
      );
    }
    const floor = await this.prisma.client.floor.findFirst({
      where: { id: context.floorId, building: { project: { companyId } } },
      select: { building: { select: { projectId: true } } },
    });
    return floor?.building.projectId ?? null;
  }

  private async owned(
    tx: Prisma.TransactionClient | PrismaService['client'],
    companyId: string,
    canvasId: string,
  ): Promise<OwnedCanvas | null> {
    const row = await tx.visualCanvas.findUnique({
      where: { id: canvasId },
      select: {
        id: true,
        status: true,
        projectId: true,
        buildingId: true,
        floorId: true,
        project: { select: { id: true, companyId: true } },
        building: { select: { project: { select: { id: true, companyId: true } } } },
        floor: {
          select: { building: { select: { project: { select: { id: true, companyId: true } } } } },
        },
      },
    });
    const project = row?.project ?? row?.building?.project ?? row?.floor?.building.project;
    if (!row || !project || project.companyId !== companyId) return null;
    return { ...row, projectOwnerId: project.id };
  }

  private async validTarget(
    tx: Prisma.TransactionClient,
    companyId: string,
    canvas: OwnedCanvas,
    target: { buildingId?: string; floorId?: string; apartmentId?: string },
  ): Promise<boolean> {
    if (canvas.projectId && target.buildingId) {
      return Boolean(
        await tx.building.findFirst({
          where: { id: target.buildingId, projectId: canvas.projectId, project: { companyId } },
        }),
      );
    }
    if (canvas.buildingId && target.floorId) {
      return Boolean(
        await tx.floor.findFirst({
          where: {
            id: target.floorId,
            buildingId: canvas.buildingId,
            building: { project: { companyId } },
          },
        }),
      );
    }
    if (canvas.floorId && target.apartmentId) {
      return Boolean(
        await tx.apartment.findFirst({
          where: {
            id: target.apartmentId,
            floorId: canvas.floorId,
            floor: { building: { project: { companyId } } },
          },
        }),
      );
    }
    return false;
  }
}

function hotspotData(input: {
  x: number;
  y: number;
  label?: string;
  buildingId?: string;
  floorId?: string;
  apartmentId?: string;
}) {
  return {
    x: input.x,
    y: input.y,
    label: input.label,
    buildingId: input.buildingId ?? null,
    floorId: input.floorId ?? null,
    apartmentId: input.apartmentId ?? null,
  };
}

function invalid() {
  return { ok: false as const, errorKey: 'invalidInput' as const };
}

function notFound() {
  return { ok: false as const, errorKey: 'notFound' as const };
}
