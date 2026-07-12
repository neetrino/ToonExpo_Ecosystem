import {
  venueEntranceInputSchema,
  venuePathEdgeIdInputSchema,
  venuePathEdgeUpsertInputSchema,
  venuePathNodeIdInputSchema,
  venuePathNodeUpsertInputSchema,
  type VenueEntranceInput,
  type VenuePathEdgeIdInput,
  type VenuePathEdgeUpsertInput,
  type VenuePathNodeIdInput,
  type VenuePathNodeUpsertInput,
} from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';
import { UNIQUE_CONSTRAINT_ERROR } from '@/lib/admin/mutation-result';

type PathMutationResult<T extends Record<string, unknown> = Record<string, never>> =
  AdminMutationResult<T>;

function invalidInput(): { ok: false; errorKey: AdminMutationErrorKey } {
  return { ok: false, errorKey: 'invalidInput' };
}

/** Store undirected edges with a stable endpoint order. */
export function normalizeEdgeNodeIds(fromNodeId: string, toNodeId: string): [string, string] {
  return fromNodeId < toNodeId ? [fromNodeId, toNodeId] : [toNodeId, fromNodeId];
}

async function syncEntranceNode(
  venueMapId: string,
  xPercent: number,
  yPercent: number,
): Promise<void> {
  const existing = await prisma.venuePathNode.findFirst({
    where: { venueMapId, kind: 'ENTRANCE' },
    select: { id: true },
  });
  if (existing) {
    await prisma.venuePathNode.update({
      where: { id: existing.id },
      data: { xPercent, yPercent },
    });
    return;
  }
  await prisma.venuePathNode.create({
    data: { venueMapId, xPercent, yPercent, kind: 'ENTRANCE' },
  });
}

export async function setVenueEntrance(
  raw: unknown,
): Promise<PathMutationResult<{ venueMapId: string }>> {
  const parsed = venueEntranceInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }
  const input: VenueEntranceInput = parsed.data;

  const venueMap = await prisma.venueMap.findUnique({
    where: { id: input.venueMapId },
    select: { id: true },
  });
  if (!venueMap) {
    return { ok: false, errorKey: 'notFound' };
  }

  await prisma.venueMap.update({
    where: { id: input.venueMapId },
    data: {
      entranceXPercent: input.entranceXPercent,
      entranceYPercent: input.entranceYPercent,
    },
  });
  await syncEntranceNode(input.venueMapId, input.entranceXPercent, input.entranceYPercent);

  return { ok: true, venueMapId: input.venueMapId };
}

export async function upsertVenuePathNode(
  raw: unknown,
): Promise<PathMutationResult<{ nodeId: string; venueMapId: string }>> {
  const parsed = venuePathNodeUpsertInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }
  const input: VenuePathNodeUpsertInput = parsed.data;

  const venueMap = await prisma.venueMap.findUnique({
    where: { id: input.venueMapId },
    select: { id: true },
  });
  if (!venueMap) {
    return { ok: false, errorKey: 'notFound' };
  }

  if (input.kind === 'BOOTH' && input.boothId) {
    const booth = await prisma.booth.findFirst({
      where: { id: input.boothId, venueMapId: input.venueMapId },
      select: { id: true },
    });
    if (!booth) {
      return { ok: false, errorKey: 'notFound' };
    }
  }

  if (input.kind === 'ENTRANCE') {
    await prisma.venueMap.update({
      where: { id: input.venueMapId },
      data: { entranceXPercent: input.xPercent, entranceYPercent: input.yPercent },
    });
  }

  try {
    if (input.nodeId) {
      return await updatePathNode({ ...input, nodeId: input.nodeId });
    }
    if (input.kind === 'ENTRANCE') {
      await syncEntranceNode(input.venueMapId, input.xPercent, input.yPercent);
      const node = await prisma.venuePathNode.findFirst({
        where: { venueMapId: input.venueMapId, kind: 'ENTRANCE' },
        select: { id: true, venueMapId: true },
      });
      if (!node) {
        return { ok: false, errorKey: 'notFound' };
      }
      return { ok: true, nodeId: node.id, venueMapId: node.venueMapId };
    }
    const created = await prisma.venuePathNode.create({
      data: {
        venueMapId: input.venueMapId,
        xPercent: input.xPercent,
        yPercent: input.yPercent,
        kind: input.kind,
        boothId: input.boothId,
      },
      select: { id: true, venueMapId: true },
    });
    return { ok: true, nodeId: created.id, venueMapId: created.venueMapId };
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR
    ) {
      return { ok: false, errorKey: 'nameTaken' };
    }
    throw error;
  }
}

async function updatePathNode(
  input: VenuePathNodeUpsertInput & { nodeId: string },
): Promise<PathMutationResult<{ nodeId: string; venueMapId: string }>> {
  const existing = await prisma.venuePathNode.findFirst({
    where: { id: input.nodeId, venueMapId: input.venueMapId },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, errorKey: 'notFound' };
  }

  if (input.kind === 'ENTRANCE') {
    const other = await prisma.venuePathNode.findFirst({
      where: { venueMapId: input.venueMapId, kind: 'ENTRANCE', NOT: { id: existing.id } },
      select: { id: true },
    });
    if (other) {
      await prisma.venuePathNode.delete({ where: { id: other.id } });
    }
  }

  await prisma.venuePathNode.update({
    where: { id: existing.id },
    data: {
      xPercent: input.xPercent,
      yPercent: input.yPercent,
      kind: input.kind,
      boothId: input.boothId ?? null,
    },
  });

  return { ok: true, nodeId: existing.id, venueMapId: input.venueMapId };
}

export async function deleteVenuePathNode(
  raw: unknown,
): Promise<PathMutationResult<{ nodeId: string; venueMapId: string }>> {
  const parsed = venuePathNodeIdInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }
  const input: VenuePathNodeIdInput = parsed.data;

  const existing = await prisma.venuePathNode.findUnique({
    where: { id: input.nodeId },
    select: { id: true, venueMapId: true, kind: true },
  });
  if (!existing) {
    return { ok: false, errorKey: 'notFound' };
  }

  await prisma.venuePathNode.delete({ where: { id: existing.id } });
  if (existing.kind === 'ENTRANCE') {
    await prisma.venueMap.update({
      where: { id: existing.venueMapId },
      data: { entranceXPercent: null, entranceYPercent: null },
    });
  }

  return { ok: true, nodeId: existing.id, venueMapId: existing.venueMapId };
}

export async function upsertVenuePathEdge(
  raw: unknown,
): Promise<PathMutationResult<{ edgeId: string; venueMapId: string }>> {
  const parsed = venuePathEdgeUpsertInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }
  const input: VenuePathEdgeUpsertInput = parsed.data;
  const [fromNodeId, toNodeId] = normalizeEdgeNodeIds(input.fromNodeId, input.toNodeId);

  const nodes = await prisma.venuePathNode.findMany({
    where: { venueMapId: input.venueMapId, id: { in: [fromNodeId, toNodeId] } },
    select: { id: true },
  });
  if (nodes.length !== 2) {
    return { ok: false, errorKey: 'notFound' };
  }

  try {
    const edge = await prisma.venuePathEdge.upsert({
      where: {
        venueMapId_fromNodeId_toNodeId: {
          venueMapId: input.venueMapId,
          fromNodeId,
          toNodeId,
        },
      },
      create: { venueMapId: input.venueMapId, fromNodeId, toNodeId },
      update: {},
      select: { id: true, venueMapId: true },
    });
    return { ok: true, edgeId: edge.id, venueMapId: edge.venueMapId };
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR
    ) {
      return { ok: false, errorKey: 'nameTaken' };
    }
    throw error;
  }
}

export async function deleteVenuePathEdge(
  raw: unknown,
): Promise<PathMutationResult<{ edgeId: string; venueMapId: string }>> {
  const parsed = venuePathEdgeIdInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }
  const input: VenuePathEdgeIdInput = parsed.data;

  const existing = await prisma.venuePathEdge.findUnique({
    where: { id: input.edgeId },
    select: { id: true, venueMapId: true },
  });
  if (!existing) {
    return { ok: false, errorKey: 'notFound' };
  }

  await prisma.venuePathEdge.delete({ where: { id: existing.id } });
  return { ok: true, edgeId: existing.id, venueMapId: existing.venueMapId };
}

/** Ensure a BOOTH path node exists at booth coordinates (idempotent). */
export async function ensureBoothPathNode(
  venueMapId: string,
  boothId: string,
  xPercent: number,
  yPercent: number,
): Promise<void> {
  await prisma.venuePathNode.upsert({
    where: {
      venueMapId_boothId: { venueMapId, boothId },
    },
    create: {
      venueMapId,
      boothId,
      xPercent,
      yPercent,
      kind: 'BOOTH',
    },
    update: {
      xPercent,
      yPercent,
      kind: 'BOOTH',
    },
  });
}
