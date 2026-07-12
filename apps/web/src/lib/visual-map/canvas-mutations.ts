import type { CanvasStatusInput, CanvasUpsertInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

import {
  type AuditActor,
  formatStatusTransition,
  recordAudit,
} from '@/lib/audit/record-audit';

import { findOwnedCanvas, resolveContextOwnership } from './canvas-ownership';
import { type VisualMapMutationResult } from './mutation-result';

export async function createCanvas(
  companyId: string,
  input: CanvasUpsertInput,
): Promise<VisualMapMutationResult<{ canvasId: string; projectId: string }>> {
  if (input.canvasId) {
    return { ok: false, errorKey: 'invalidInput' };
  }

  return prisma.$transaction(async (tx) => {
    const ownership = await resolveContextOwnership(tx, companyId, {
      projectId: input.projectId,
      buildingId: input.buildingId,
      floorId: input.floorId,
    });
    if (!ownership) {
      return { ok: false, errorKey: 'notFound' };
    }

    const canvas = await tx.visualCanvas.create({
      data: {
        title: input.title,
        imageUrl: input.imageUrl,
        imageAlt: input.imageAlt,
        projectId: input.projectId,
        buildingId: input.buildingId,
        floorId: input.floorId,
      },
      select: { id: true },
    });

    return {
      ok: true,
      canvasId: canvas.id,
      projectId: ownership.owningProjectId,
    };
  });
}

export async function updateCanvas(
  companyId: string,
  input: CanvasUpsertInput,
): Promise<VisualMapMutationResult<{ canvasId: string; projectId: string }>> {
  if (!input.canvasId) {
    return { ok: false, errorKey: 'invalidInput' };
  }

  return prisma.$transaction(async (tx) => {
    const owned = await findOwnedCanvas(tx, companyId, input.canvasId!);
    if (!owned) {
      return { ok: false, errorKey: 'notFound' };
    }

    await tx.visualCanvas.update({
      where: { id: owned.id },
      data: {
        title: input.title,
        imageUrl: input.imageUrl,
        imageAlt: input.imageAlt,
      },
    });

    return { ok: true, canvasId: owned.id, projectId: owned.owningProjectId };
  });
}

/** Canvas publication change — audit written inside the same transaction (atomic). */
export async function setCanvasStatus(
  companyId: string,
  input: CanvasStatusInput,
  actor: AuditActor,
): Promise<VisualMapMutationResult<{ canvasId: string; projectId: string }>> {
  return prisma.$transaction(async (tx) => {
    const owned = await findOwnedCanvas(tx, companyId, input.canvasId);
    if (!owned) {
      return { ok: false, errorKey: 'notFound' };
    }

    await tx.visualCanvas.update({
      where: { id: owned.id },
      data: { status: input.status },
    });

    await recordAudit(tx, {
      actor,
      action: 'PUBLICATION_CHANGE',
      entityType: 'VISUAL_CANVAS',
      entityId: owned.id,
      companyId,
      detail: formatStatusTransition(owned.status, input.status),
    });

    return { ok: true, canvasId: owned.id, projectId: owned.owningProjectId };
  });
}

/**
 * Hard-delete is allowed for DRAFT canvases only (doc 06). Published/archived use archive.
 */
export async function deleteCanvas(
  companyId: string,
  canvasId: string,
): Promise<VisualMapMutationResult<{ canvasId: string; projectId: string }>> {
  return prisma.$transaction(async (tx) => {
    const owned = await findOwnedCanvas(tx, companyId, canvasId);
    if (!owned) {
      return { ok: false, errorKey: 'notFound' };
    }
    if (owned.status !== 'DRAFT') {
      return { ok: false, errorKey: 'invalidInput' };
    }

    await tx.visualCanvas.delete({ where: { id: owned.id } });
    return { ok: true, canvasId: owned.id, projectId: owned.owningProjectId };
  });
}
