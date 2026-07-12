import {
  boothIdInputSchema,
  boothMoveInputSchema,
  boothUpsertInputSchema,
  venueMapUpsertInputSchema,
  type BoothIdInput,
  type BoothMoveInput,
  type BoothUpsertInput,
  type VenueMapUpsertInput,
} from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';
import { UNIQUE_CONSTRAINT_ERROR } from '@/lib/admin/mutation-result';
import { bestEffortDeleteReplacedR2Object } from '@/lib/storage';

import { ensureBoothPathNode } from './venue-path-mutations';

export type VenueMutationResult<T extends Record<string, unknown> = Record<string, never>> =
  AdminMutationResult<T>;

function invalidInput(): { ok: false; errorKey: AdminMutationErrorKey } {
  return { ok: false, errorKey: 'invalidInput' };
}

function isBoothCodeUniqueViolation(error: Prisma.PrismaClientKnownRequestError): boolean {
  const target = error.meta?.target;
  return Array.isArray(target) && target.includes('code');
}

async function assertCompanyExists(companyId: string | undefined): Promise<boolean> {
  if (!companyId) {
    return true;
  }
  const row = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
  return row != null;
}

async function assertPartnerExists(partnerId: string | undefined): Promise<boolean> {
  if (!partnerId) {
    return true;
  }
  const row = await prisma.partner.findUnique({ where: { id: partnerId }, select: { id: true } });
  return row != null;
}

async function assertProjectAssignment(
  projectId: string | undefined,
  companyId: string | undefined,
): Promise<boolean> {
  if (!projectId) {
    return true;
  }
  const row = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, companyId: true },
  });
  if (!row) {
    return false;
  }
  if (companyId && row.companyId !== companyId) {
    return false;
  }
  return true;
}

/**
 * Upsert the single venue map for an exhibition event (admin-only caller).
 */
export async function upsertVenueMap(
  raw: unknown,
): Promise<VenueMutationResult<{ venueMapId: string; eventId: string }>> {
  const parsed = venueMapUpsertInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }
  const input: VenueMapUpsertInput = parsed.data;

  const event = await prisma.exhibitionEvent.findUnique({
    where: { id: input.eventId },
    select: { id: true },
  });
  if (!event) {
    return { ok: false, errorKey: 'notFound' };
  }

  const previous = await prisma.venueMap.findUnique({
    where: { eventId: input.eventId },
    select: { imageUrl: true },
  });

  const hasEntrance = input.entranceXPercent !== undefined && input.entranceYPercent !== undefined;

  const venueMap = await prisma.venueMap.upsert({
    where: { eventId: input.eventId },
    create: {
      eventId: input.eventId,
      imageUrl: input.imageUrl,
      imageAlt: input.imageAlt,
      entranceXPercent: hasEntrance ? input.entranceXPercent : undefined,
      entranceYPercent: hasEntrance ? input.entranceYPercent : undefined,
    },
    update: {
      imageUrl: input.imageUrl,
      imageAlt: input.imageAlt ?? null,
      ...(hasEntrance
        ? {
            entranceXPercent: input.entranceXPercent,
            entranceYPercent: input.entranceYPercent,
          }
        : {}),
    },
    select: { id: true, eventId: true },
  });

  await bestEffortDeleteReplacedR2Object(previous?.imageUrl, input.imageUrl);

  return { ok: true, venueMapId: venueMap.id, eventId: venueMap.eventId };
}

export async function upsertBooth(
  raw: unknown,
): Promise<VenueMutationResult<{ boothId: string; venueMapId: string }>> {
  const parsed = boothUpsertInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }
  const input: BoothUpsertInput = parsed.data;

  const venueMap = await prisma.venueMap.findUnique({
    where: { id: input.venueMapId },
    select: { id: true },
  });
  if (!venueMap) {
    return { ok: false, errorKey: 'notFound' };
  }

  if (!(await assertCompanyExists(input.companyId))) {
    return { ok: false, errorKey: 'notFound' };
  }
  if (!(await assertPartnerExists(input.partnerId))) {
    return { ok: false, errorKey: 'notFound' };
  }
  if (!(await assertProjectAssignment(input.projectId, input.companyId))) {
    return { ok: false, errorKey: 'notFound' };
  }

  try {
    if (input.boothId) {
      return await updateBoothRow({ ...input, boothId: input.boothId });
    }
    return await createBoothRow(input);
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR &&
      isBoothCodeUniqueViolation(error)
    ) {
      return { ok: false, errorKey: 'nameTaken' };
    }
    throw error;
  }
}

async function createBoothRow(
  input: BoothUpsertInput,
): Promise<VenueMutationResult<{ boothId: string; venueMapId: string }>> {
  const booth = await prisma.booth.create({
    data: {
      venueMapId: input.venueMapId,
      code: input.code.toUpperCase(),
      label: input.label,
      xPercent: input.xPercent,
      yPercent: input.yPercent,
      companyId: input.companyId,
      partnerId: input.partnerId,
      projectId: input.projectId,
      note: input.note,
      sortOrder: input.sortOrder ?? 0,
    },
    select: { id: true, venueMapId: true },
  });
  await ensureBoothPathNode(booth.venueMapId, booth.id, input.xPercent, input.yPercent);
  return { ok: true, boothId: booth.id, venueMapId: booth.venueMapId };
}

async function updateBoothRow(
  input: BoothUpsertInput & { boothId: string },
): Promise<VenueMutationResult<{ boothId: string; venueMapId: string }>> {
  const existing = await prisma.booth.findFirst({
    where: { id: input.boothId, venueMapId: input.venueMapId },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, errorKey: 'notFound' };
  }

  await prisma.booth.update({
    where: { id: existing.id },
    data: {
      code: input.code.toUpperCase(),
      label: input.label,
      xPercent: input.xPercent,
      yPercent: input.yPercent,
      companyId: input.companyId ?? null,
      partnerId: input.partnerId ?? null,
      projectId: input.projectId ?? null,
      note: input.note ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  await ensureBoothPathNode(input.venueMapId, existing.id, input.xPercent, input.yPercent);

  return { ok: true, boothId: existing.id, venueMapId: input.venueMapId };
}

export async function moveBooth(
  raw: unknown,
): Promise<VenueMutationResult<{ boothId: string; venueMapId: string }>> {
  const parsed = boothMoveInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }
  const input: BoothMoveInput = parsed.data;

  const existing = await prisma.booth.findUnique({
    where: { id: input.boothId },
    select: { id: true, venueMapId: true },
  });
  if (!existing) {
    return { ok: false, errorKey: 'notFound' };
  }

  await prisma.booth.update({
    where: { id: existing.id },
    data: { xPercent: input.xPercent, yPercent: input.yPercent },
  });
  await ensureBoothPathNode(existing.venueMapId, existing.id, input.xPercent, input.yPercent);

  return { ok: true, boothId: existing.id, venueMapId: existing.venueMapId };
}

export async function deleteBooth(
  raw: unknown,
): Promise<VenueMutationResult<{ boothId: string; venueMapId: string }>> {
  const parsed = boothIdInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }
  const input: BoothIdInput = parsed.data;

  const existing = await prisma.booth.findUnique({
    where: { id: input.boothId },
    select: { id: true, venueMapId: true },
  });
  if (!existing) {
    return { ok: false, errorKey: 'notFound' };
  }

  await prisma.booth.delete({ where: { id: existing.id } });
  return { ok: true, boothId: existing.id, venueMapId: existing.venueMapId };
}
