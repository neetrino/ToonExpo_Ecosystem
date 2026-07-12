import type { PrismaClient } from '@toonexpo/db';
import type { ApartmentStatus, DealStage } from '@toonexpo/domain';

import {
  recordApartmentStatusHistory,
  recordApartmentStatusHistoryMany,
} from '../shared/apartment-status-history';

import { ACTIVE_INVENTORY_HOLD_STAGES } from './constants';

export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export type CompanyDealRow = {
  id: string;
  stage: DealStage;
  projectId: string | null;
  assignedUserId: string | null;
  _count: { apartments: number };
};

/** Thrown inside a Prisma transaction to roll back after a partial inventory claim. */
export class CrmInventoryAbortError extends Error {
  readonly errorKey = 'reservationConflict' as const;

  constructor() {
    super('reservationConflict');
    this.name = 'CrmInventoryAbortError';
  }
}

export async function findCompanyDeal(
  tx: TransactionClient,
  companyId: string,
  dealId: string,
): Promise<CompanyDealRow | null> {
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

export async function listDealApartmentIds(
  tx: TransactionClient,
  dealId: string,
): Promise<string[]> {
  const links = await tx.dealApartment.findMany({
    where: { dealId },
    select: { apartmentId: true },
  });
  return links.map((link) => link.apartmentId);
}

/**
 * Union of deal.projectId and project IDs derived from linked apartments.
 */
export async function collectAffectedProjectIds(
  tx: TransactionClient,
  dealProjectId: string | null,
  apartmentIds: string[],
): Promise<string[]> {
  const projectIds = new Set<string>();
  if (dealProjectId) {
    projectIds.add(dealProjectId);
  }

  if (apartmentIds.length === 0) {
    return [...projectIds];
  }

  const apartments = await tx.apartment.findMany({
    where: { id: { in: apartmentIds } },
    select: { floor: { select: { building: { select: { projectId: true } } } } },
  });
  for (const apartment of apartments) {
    projectIds.add(apartment.floor.building.projectId);
  }

  return [...projectIds];
}

export async function findCompanyApartment(
  tx: TransactionClient,
  companyId: string,
  apartmentId: string,
): Promise<{
  id: string;
  status: ApartmentStatus;
  priceAmd: number | null;
  projectId: string;
} | null> {
  const apartment = await tx.apartment.findFirst({
    where: {
      id: apartmentId,
      floor: { building: { project: { companyId } } },
    },
    select: {
      id: true,
      status: true,
      priceAmd: true,
      floor: { select: { building: { select: { projectId: true } } } },
    },
  });

  if (!apartment) {
    return null;
  }

  return {
    id: apartment.id,
    status: apartment.status,
    priceAmd: apartment.priceAmd,
    projectId: apartment.floor.building.projectId,
  };
}

export async function isCompanyMember(
  tx: TransactionClient,
  companyId: string,
  userId: string,
): Promise<boolean> {
  const member = await tx.companyMember.findFirst({
    where: { companyId, userId },
    select: { id: true },
  });
  return member !== null;
}

export async function isCompanyProject(
  tx: TransactionClient,
  companyId: string,
  projectId: string,
): Promise<boolean> {
  const project = await tx.project.findFirst({
    where: { id: projectId, companyId },
    select: { id: true },
  });
  return project !== null;
}

/**
 * Race-safe inventory claim under Read Committed (preferred over Serializable+retry).
 * Conditional updateMany: only AVAILABLE rows, or rows held solely by this deal
 * (linked to dealId with no other active RESERVED/CONVERTED holder).
 * Partial matches must abort the surrounding transaction so changed rows roll back.
 * When `changedByUserId` is set, appends ApartmentStatusHistory in the same tx.
 */
export async function claimApartmentsForDeal(
  tx: TransactionClient,
  apartmentIds: string[],
  status: 'RESERVED' | 'SOLD',
  dealId: string,
  changedByUserId?: string,
): Promise<'ok' | 'reservationConflict'> {
  if (apartmentIds.length === 0) {
    return 'ok';
  }

  const before = changedByUserId
    ? await tx.apartment.findMany({
        where: { id: { in: apartmentIds } },
        select: { id: true, status: true },
      })
    : [];

  const result = await tx.apartment.updateMany({
    where: {
      id: { in: apartmentIds },
      OR: [
        { status: 'AVAILABLE' },
        {
          status: { in: ['RESERVED', 'SOLD'] },
          AND: [
            { dealLinks: { some: { dealId } } },
            {
              dealLinks: {
                none: {
                  dealId: { not: dealId },
                  deal: { stage: { in: [...ACTIVE_INVENTORY_HOLD_STAGES] } },
                },
              },
            },
          ],
        },
      ],
    },
    data: { status },
  });

  if (result.count < apartmentIds.length) {
    return 'reservationConflict';
  }

  if (changedByUserId) {
    await recordApartmentStatusHistoryMany(
      tx,
      before.map((apartment) => ({
        apartmentId: apartment.id,
        dealId,
        source: 'CRM_STAGE',
        oldStatus: apartment.status,
        newStatus: status,
        changedByUserId,
      })),
    );
  }

  return 'ok';
}

/**
 * Releases reservation when no other active hold remains (doc 04 Release Reservation).
 * When `changedByUserId` is set, appends ApartmentStatusHistory in the same tx.
 */
export async function releaseApartmentsIfUnheld(
  tx: TransactionClient,
  apartmentIds: string[],
  excludeDealId: string,
  changedByUserId?: string,
): Promise<void> {
  for (const apartmentId of apartmentIds) {
    const otherHold = await tx.dealApartment.findFirst({
      where: {
        apartmentId,
        dealId: { not: excludeDealId },
        deal: { stage: { in: [...ACTIVE_INVENTORY_HOLD_STAGES] } },
      },
      select: { id: true },
    });
    if (otherHold) {
      continue;
    }

    const result = await tx.apartment.updateMany({
      where: { id: apartmentId, status: 'RESERVED' },
      data: { status: 'AVAILABLE' },
    });

    if (result.count === 1 && changedByUserId) {
      await recordApartmentStatusHistory(tx, {
        apartmentId,
        dealId: excludeDealId,
        source: 'CRM_STAGE',
        oldStatus: 'RESERVED',
        newStatus: 'AVAILABLE',
        changedByUserId,
      });
    }
  }
}

export function statusChangeBody(from: DealStage, to: DealStage): string {
  return `${from}→${to}`;
}
