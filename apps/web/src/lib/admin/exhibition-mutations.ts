import {
  exhibitionEventUpsertInputSchema,
  type ExhibitionEventUpsertInput,
} from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';
import { UNIQUE_CONSTRAINT_ERROR } from '@/lib/admin/mutation-result';
import {
  type AuditActor,
  formatStatusTransition,
  recordAudit,
} from '@/lib/audit/record-audit';

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
  actor: AuditActor,
  excludeEventId?: string,
): Promise<void> {
  const active = await tx.exhibitionEvent.findMany({
    where: {
      status: 'ACTIVE',
      ...(excludeEventId ? { id: { not: excludeEventId } } : {}),
    },
    select: { id: true, status: true },
  });

  if (active.length === 0) {
    return;
  }

  await tx.exhibitionEvent.updateMany({
    where: { id: { in: active.map((event) => event.id) } },
    data: { status: 'PLANNING' },
  });

  for (const event of active) {
    await recordAudit(tx, {
      actor,
      action: 'PUBLICATION_CHANGE',
      entityType: 'EXHIBITION_EVENT',
      entityId: event.id,
      detail: formatStatusTransition(event.status, 'PLANNING'),
    });
  }
}

async function createEvent(
  tx: TransactionClient,
  input: ExhibitionEventUpsertInput,
  actor: AuditActor,
): Promise<ExhibitionEventMutationResult> {
  if (input.status === 'ACTIVE') {
    await demoteOtherActiveEvents(tx, actor);
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

  await recordAudit(tx, {
    actor,
    action: 'PUBLICATION_CHANGE',
    entityType: 'EXHIBITION_EVENT',
    entityId: created.id,
    detail: formatStatusTransition('NEW', input.status),
  });

  return { ok: true, eventId: created.id };
}

async function updateEvent(
  tx: TransactionClient,
  input: ExhibitionEventUpsertInput & { eventId: string },
  actor: AuditActor,
): Promise<ExhibitionEventMutationResult> {
  const existing = await tx.exhibitionEvent.findUnique({
    where: { id: input.eventId },
    select: { id: true, status: true },
  });
  if (!existing) {
    return { ok: false, errorKey: 'notFound' };
  }

  if (input.status === 'ACTIVE') {
    await demoteOtherActiveEvents(tx, actor, input.eventId);
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

  if (existing.status !== input.status) {
    await recordAudit(tx, {
      actor,
      action: 'PUBLICATION_CHANGE',
      entityType: 'EXHIBITION_EVENT',
      entityId: existing.id,
      detail: formatStatusTransition(existing.status, input.status),
    });
  }

  return { ok: true, eventId: input.eventId };
}

/**
 * Exhibition event upsert — status changes (incl. ACTIVE demotions) audited
 * inside the same transaction (atomic).
 */
export async function upsertExhibitionEvent(
  raw: unknown,
  actor: AuditActor,
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
    return await prisma.$transaction(async (tx) => {
      if (input.eventId) {
        return updateEvent(tx, { ...input, eventId: input.eventId }, actor);
      }
      return createEvent(tx, input, actor);
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
