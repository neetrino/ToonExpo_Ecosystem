import type { PrismaClient } from '@toonexpo/db';
import type { ApartmentStatus, DealStage } from '@toonexpo/domain';

export type Tx = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export const REQUIRED_APARTMENT_STAGES: readonly DealStage[] = ['RESERVED', 'CONVERTED'];
const HOLD_STAGES: readonly DealStage[] = ['RESERVED', 'CONVERTED'];

export class InventoryConflictError extends Error {}

export function findDeal(tx: Tx, companyId: string, dealId: string) {
  return tx.deal.findFirst({
    where: { id: dealId, companyId },
    select: {
      id: true,
      stage: true,
      projectId: true,
      assignedUserId: true,
      _count: { select: { apartments: true } },
    },
  });
}

export async function apartmentIds(tx: Tx, dealId: string): Promise<string[]> {
  const rows = await tx.dealApartment.findMany({
    where: { dealId },
    select: { apartmentId: true },
  });
  return rows.map(({ apartmentId }) => apartmentId);
}

export async function projectIds(
  tx: Tx,
  projectId: string | null,
  ids: string[],
): Promise<string[]> {
  const result = new Set<string>(projectId ? [projectId] : []);
  const rows = await tx.apartment.findMany({
    where: { id: { in: ids } },
    select: { floor: { select: { building: { select: { projectId: true } } } } },
  });
  rows.forEach((row) => result.add(row.floor.building.projectId));
  return [...result];
}

export async function findApartment(tx: Tx, companyId: string, apartmentId: string) {
  const row = await tx.apartment.findFirst({
    where: { id: apartmentId, floor: { building: { project: { companyId } } } },
    select: {
      id: true,
      status: true,
      priceAmd: true,
      floor: { select: { building: { select: { projectId: true } } } },
    },
  });
  return row
    ? {
        id: row.id,
        status: row.status,
        priceAmd: row.priceAmd,
        projectId: row.floor.building.projectId,
      }
    : null;
}

export async function isMember(tx: Tx, companyId: string, userId: string): Promise<boolean> {
  return Boolean(
    await tx.companyMember.findFirst({
      where: { companyId, userId },
      select: { id: true },
    }),
  );
}

export async function claim(
  tx: Tx,
  ids: string[],
  status: 'RESERVED' | 'SOLD',
  dealId: string,
  userId: string,
): Promise<void> {
  const before = await tx.apartment.findMany({
    where: { id: { in: ids } },
    select: { id: true, status: true },
  });
  const result = await tx.apartment.updateMany({
    where: {
      id: { in: ids },
      OR: [
        { status: 'AVAILABLE' },
        {
          status: { in: ['RESERVED', 'SOLD'] },
          AND: [
            { dealLinks: { some: { dealId } } },
            {
              dealLinks: {
                none: { dealId: { not: dealId }, deal: { stage: { in: [...HOLD_STAGES] } } },
              },
            },
          ],
        },
      ],
    },
    data: { status },
  });
  if (result.count < ids.length) throw new InventoryConflictError();
  await writeHistory(tx, before, status, dealId, userId);
}

export async function release(
  tx: Tx,
  ids: string[],
  dealId: string,
  userId: string,
): Promise<void> {
  for (const apartmentId of ids) {
    const hold = await tx.dealApartment.findFirst({
      where: {
        apartmentId,
        dealId: { not: dealId },
        deal: { stage: { in: [...HOLD_STAGES] } },
      },
      select: { id: true },
    });
    if (hold) continue;
    const result = await tx.apartment.updateMany({
      where: { id: apartmentId, status: 'RESERVED' },
      data: { status: 'AVAILABLE' },
    });
    if (result.count) {
      await tx.apartmentStatusHistory.create({
        data: history(apartmentId, dealId, 'RESERVED', 'AVAILABLE', userId),
      });
    }
  }
}

export async function recomputeFollowUp(tx: Tx, dealId: string): Promise<void> {
  const next = await tx.dealActivity.findFirst({
    where: { dealId, type: 'FOLLOW_UP', status: 'PLANNED', dueAt: { not: null } },
    orderBy: { dueAt: 'asc' },
    select: { dueAt: true },
  });
  await tx.deal.update({
    where: { id: dealId },
    data: { nextFollowUpAt: next?.dueAt ?? null },
  });
}

async function writeHistory(
  tx: Tx,
  rows: Array<{ id: string; status: ApartmentStatus }>,
  next: ApartmentStatus,
  dealId: string,
  userId: string,
): Promise<void> {
  const changed = rows.filter((row) => row.status !== next);
  if (!changed.length) return;
  await tx.apartmentStatusHistory.createMany({
    data: changed.map((row) => history(row.id, dealId, row.status, next, userId)),
  });
}

function history(
  apartmentId: string,
  dealId: string,
  oldStatus: ApartmentStatus,
  newStatus: ApartmentStatus,
  changedByUserId: string,
) {
  return {
    apartmentId,
    dealId,
    source: 'CRM_STAGE' as const,
    oldStatus,
    newStatus,
    changedByUserId,
    reason: null,
  };
}
