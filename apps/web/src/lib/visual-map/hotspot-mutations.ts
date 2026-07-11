import type { HotspotMoveInput, HotspotUpsertInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

import { findOwnedCanvas } from './canvas-ownership';
import { type VisualMapMutationResult } from './mutation-result';
import { targetData, validateHotspotTarget } from './target-validation';

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
      where: { id: input.hotspotId, canvasId: owned.id },
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
      where: { id: input.hotspotId },
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

export async function deleteHotspot(
  companyId: string,
  hotspotId: string,
): Promise<VisualMapMutationResult<{ hotspotId: string; projectId: string }>> {
  return prisma.$transaction(async (tx) => {
    const hotspot = await tx.hotspot.findFirst({
      where: { id: hotspotId },
      select: { id: true, canvasId: true },
    });
    if (!hotspot) {
      return { ok: false, errorKey: 'notFound' };
    }

    const owned = await findOwnedCanvas(tx, companyId, hotspot.canvasId);
    if (!owned) {
      return { ok: false, errorKey: 'notFound' };
    }

    await tx.hotspot.delete({ where: { id: hotspot.id } });
    return {
      ok: true,
      hotspotId: hotspot.id,
      projectId: owned.owningProjectId,
    };
  });
}
