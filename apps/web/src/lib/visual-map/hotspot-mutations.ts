import type { HotspotMoveInput, HotspotUpsertInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

import { findOwnedCanvas } from './canvas-ownership';
import { type VisualMapMutationResult } from './mutation-result';
import { targetData, validateHotspotTarget } from './target-validation';

const ACTIVE_HOTSPOT_FILTER = { archivedAt: null } as const;

export async function createHotspot(
  companyId: string,
  input: HotspotUpsertInput,
): Promise<VisualMapMutationResult<{ hotspotId: string; projectId: string }>> {
  if (input.hotspotId) {
    return { ok: false, errorKey: 'invalidInput' };
  }

  return prisma.$transaction(async (tx) => {
    const owned = await findOwnedCanvas(tx, companyId, input.canvasId);
    if (!owned) {
      return { ok: false, errorKey: 'notFound' };
    }

    const targetCheck = await validateHotspotTarget(tx, companyId, owned, {
      buildingId: input.buildingId,
      floorId: input.floorId,
      apartmentId: input.apartmentId,
    });
    if (targetCheck === 'notFound') {
      return { ok: false, errorKey: 'notFound' };
    }
    if (targetCheck === 'targetMismatch') {
      return { ok: false, errorKey: 'targetMismatch' };
    }

    const hotspot = await tx.hotspot.create({
      data: {
        canvasId: owned.id,
        x: input.x,
        y: input.y,
        label: input.label,
        ...targetData({
          buildingId: input.buildingId,
          floorId: input.floorId,
          apartmentId: input.apartmentId,
        }),
      },
      select: { id: true },
    });

    return {
      ok: true,
      hotspotId: hotspot.id,
      projectId: owned.owningProjectId,
    };
  });
}

export async function updateHotspot(
  companyId: string,
  input: HotspotUpsertInput,
): Promise<VisualMapMutationResult<{ hotspotId: string; projectId: string }>> {
  if (!input.hotspotId) {
    return { ok: false, errorKey: 'invalidInput' };
  }

  return prisma.$transaction(async (tx) => {
    const owned = await findOwnedCanvas(tx, companyId, input.canvasId);
    if (!owned) {
      return { ok: false, errorKey: 'notFound' };
    }

    const existing = await tx.hotspot.findFirst({
      where: { id: input.hotspotId, canvasId: owned.id, ...ACTIVE_HOTSPOT_FILTER },
      select: { id: true },
    });
    if (!existing) {
      return { ok: false, errorKey: 'notFound' };
    }

    const targetCheck = await validateHotspotTarget(tx, companyId, owned, {
      buildingId: input.buildingId,
      floorId: input.floorId,
      apartmentId: input.apartmentId,
    });
    if (targetCheck === 'notFound') {
      return { ok: false, errorKey: 'notFound' };
    }
    if (targetCheck === 'targetMismatch') {
      return { ok: false, errorKey: 'targetMismatch' };
    }

    await tx.hotspot.update({
      where: { id: existing.id },
      data: {
        x: input.x,
        y: input.y,
        label: input.label,
        ...targetData({
          buildingId: input.buildingId,
          floorId: input.floorId,
          apartmentId: input.apartmentId,
        }),
      },
    });

    return {
      ok: true,
      hotspotId: existing.id,
      projectId: owned.owningProjectId,
    };
  });
}

export async function moveHotspot(
  companyId: string,
  input: HotspotMoveInput,
): Promise<VisualMapMutationResult<{ hotspotId: string; projectId: string }>> {
  return prisma.$transaction(async (tx) => {
    const hotspot = await tx.hotspot.findFirst({
      where: { id: input.hotspotId, ...ACTIVE_HOTSPOT_FILTER },
      select: { id: true, canvasId: true },
    });
    if (!hotspot) {
      return { ok: false, errorKey: 'notFound' };
    }

    const owned = await findOwnedCanvas(tx, companyId, hotspot.canvasId);
    if (!owned) {
      return { ok: false, errorKey: 'notFound' };
    }

    await tx.hotspot.update({
      where: { id: hotspot.id },
      data: { x: input.x, y: input.y },
    });

    return {
      ok: true,
      hotspotId: hotspot.id,
      projectId: owned.owningProjectId,
    };
  });
}

/**
 * Soft-archives a hotspot. Hard-delete is allowed only on DRAFT canvases (mirrors canvas delete policy).
 */
export async function archiveHotspot(
  companyId: string,
  hotspotId: string,
): Promise<VisualMapMutationResult<{ hotspotId: string; projectId: string }>> {
  return prisma.$transaction(async (tx) => {
    const hotspot = await tx.hotspot.findFirst({
      where: { id: hotspotId, ...ACTIVE_HOTSPOT_FILTER },
      select: { id: true, canvasId: true },
    });
    if (!hotspot) {
      return { ok: false, errorKey: 'notFound' };
    }

    const owned = await findOwnedCanvas(tx, companyId, hotspot.canvasId);
    if (!owned) {
      return { ok: false, errorKey: 'notFound' };
    }

    if (owned.status === 'DRAFT') {
      await tx.hotspot.delete({ where: { id: hotspot.id } });
    } else {
      await tx.hotspot.update({
        where: { id: hotspot.id },
        data: { archivedAt: new Date() },
      });
    }

    return {
      ok: true,
      hotspotId: hotspot.id,
      projectId: owned.owningProjectId,
    };
  });
}

/** Restores a soft-archived hotspot on a company-owned canvas. */
export async function restoreHotspot(
  companyId: string,
  hotspotId: string,
): Promise<VisualMapMutationResult<{ hotspotId: string; projectId: string }>> {
  return prisma.$transaction(async (tx) => {
    const hotspot = await tx.hotspot.findFirst({
      where: { id: hotspotId, archivedAt: { not: null } },
      select: { id: true, canvasId: true },
    });
    if (!hotspot) {
      return { ok: false, errorKey: 'notFound' };
    }

    const owned = await findOwnedCanvas(tx, companyId, hotspot.canvasId);
    if (!owned) {
      return { ok: false, errorKey: 'notFound' };
    }

    await tx.hotspot.update({
      where: { id: hotspot.id },
      data: { archivedAt: null },
    });

    return {
      ok: true,
      hotspotId: hotspot.id,
      projectId: owned.owningProjectId,
    };
  });
}

/** @deprecated Use archiveHotspot — kept for existing action imports. */
export const deleteHotspot = archiveHotspot;
