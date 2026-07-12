import {
  exhibitionEventUpsertInputSchema,
  type ExhibitionEventUpsertInput,
} from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';
import { UNIQUE_CONSTRAINT_ERROR } from '@/lib/admin/mutation-result';

export type ExhibitionEventMutationResult = AdminMutationResult<{ eventId: string }>;

function isCodeUniqueViolation(error: Prisma.PrismaClientKnownRequestError): boolean {
  const target = error.meta?.target;
  return Array.isArray(target) && target.includes('code');
}

function invalidInput(): { ok: false; errorKey: AdminMutationErrorKey } {
  return { ok: false, errorKey: 'invalidInput' };
}

export async function upsertExhibitionEvent(
  raw: unknown,
): Promise<ExhibitionEventMutationResult> {
  const parsed = exhibitionEventUpsertInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const input = parsed.data;
  if (input.startDate && input.endDate && input.endDate < input.startDate) {
    return invalidInput();
  }

  try {
    if (input.eventId) {
      return updateEvent({ ...input, eventId: input.eventId });
    }
    return createEvent(input);
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR &&
      isCodeUniqueViolation(error)
    ) {
      return { ok: false, errorKey: 'nameTaken' };
    }
    throw error;
  }
}

async function createEvent(
  input: ExhibitionEventUpsertInput,
): Promise<ExhibitionEventMutationResult> {
  const created = await prisma.exhibitionEvent.create({
    data: {
      name: input.name,
      code: input.code.toLowerCase(),
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status,
    },
    select: { id: true },
  });
  return { ok: true, eventId: created.id };
}

async function updateEvent(
  input: ExhibitionEventUpsertInput & { eventId: string },
): Promise<ExhibitionEventMutationResult> {
  const existing = await prisma.exhibitionEvent.findUnique({
    where: { id: input.eventId },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, errorKey: 'notFound' };
  }

  await prisma.exhibitionEvent.update({
    where: { id: input.eventId },
    data: {
      name: input.name,
      code: input.code.toLowerCase(),
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      status: input.status,
    },
  });
  return { ok: true, eventId: input.eventId };
}
