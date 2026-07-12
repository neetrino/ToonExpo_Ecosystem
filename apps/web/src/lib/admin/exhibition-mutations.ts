import {
  exhibitionEventUpsertInputSchema,
  type ExhibitionEventUpsertInput,
} from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';
import { UNIQUE_CONSTRAINT_ERROR } from '@/lib/admin/mutation-result';

export type ExhibitionEventMutationResult = AdminMutationResult<{ eventId: string }>;

type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

function isCodeUniqueViolation(error: Prisma.PrismaClientKnownRequestError): boolean {
  const target = error.meta?.target;
  return Array.isArray(target) && target.includes('code');
}

function invalidInput(): { ok: false; errorKey: AdminMutationErrorKey } {
  return { ok: false, errorKey: 'invalidInput' };
}

async function demoteOtherActiveEvents(
  tx: TransactionClient,
  excludeEventId?: string,
): Promise<void> {
  await tx.exhibitionEvent.updateMany({
    where: {
      status: 'ACTIVE',
      ...(excludeEventId ? { id: { not: excludeEventId } } : {}),
    },
    data: { status: 'PLANNING' },
  });
}

async function createEvent(
  tx: TransactionClient,
  input: ExhibitionEventUpsertInput,
): Promise<ExhibitionEventMutationResult> {
  if (input.status === 'ACTIVE') {
    await demoteOtherActiveEvents(tx);
  }

  const created = await tx.exhibitionEvent.create({
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
  tx: TransactionClient,
  input: ExhibitionEventUpsertInput & { eventId: string },
): Promise<ExhibitionEventMutationResult> {
  const existing = await tx.exhibitionEvent.findUnique({
    where: { id: input.eventId },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, errorKey: 'notFound' };
  }

  if (input.status === 'ACTIVE') {
    await demoteOtherActiveEvents(tx, input.eventId);
  }

  await tx.exhibitionEvent.update({
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

export async function upsertExhibitionEvent(raw: unknown): Promise<ExhibitionEventMutationResult> {
  const parsed = exhibitionEventUpsertInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const input = parsed.data;
  if (input.startDate && input.endDate && input.endDate < input.startDate) {
    return invalidInput();
  }

  try {
    return await prisma.$transaction(async (tx) => {
      if (input.eventId) {
        return updateEvent(tx, { ...input, eventId: input.eventId });
      }
      return createEvent(tx, input);
    });
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
