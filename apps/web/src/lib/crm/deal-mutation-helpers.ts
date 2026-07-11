import type { PrismaClient } from '@toonexpo/db';
import type { ApartmentStatus, DealStage } from '@toonexpo/domain';

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

export async function findCompanyApartment(
  tx: TransactionClient,
  companyId: string,
  apartmentId: string,
): Promise<{ id: string; status: ApartmentStatus; projectId: string } | null> {
  const apartment = await tx.apartment.findFirst({
    where: {
      id: apartmentId,
      floor: { building: { project: { companyId } } },
    },
    select: {
      id: true,
      status: true,
      floor: { select: { building: { select: { projectId: true } } } },
    },
  });

  if (!apartment) {
    return null;
  }

  return {
    id: apartment.id,
    status: apartment.status,
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
 * Blocks when another deal already holds the apartment (doc 04 Reservation Conflict).
 */
export async function hasReservationConflict(
  tx: TransactionClient,
  apartmentIds: string[],
  excludeDealId: string,
): Promise<boolean> {
  if (apartmentIds.length === 0) {
    return false;
  }

  const conflictingLink = await tx.dealApartment.findFirst({
    where: {
      apartmentId: { in: apartmentIds },
      dealId: { not: excludeDealId },
      deal: { stage: { in: [...ACTIVE_INVENTORY_HOLD_STAGES] } },
    },
    select: { id: true },
  });
  if (conflictingLink) {
    return true;
  }

  const soldOrForeignReserved = await tx.apartment.findFirst({
    where: {
      id: { in: apartmentIds },
      OR: [
        {
          status: 'SOLD',
          // Allow reclaim when this deal already links the apartment (e.g. CONVERTED→RESERVED).
          dealLinks: { none: { dealId: excludeDealId } },
        },
        {
          status: 'RESERVED',
          dealLinks: { none: { dealId: excludeDealId } },
        },
      ],
    },
    select: { id: true },
  });

  return soldOrForeignReserved !== null;
}

/**
 * Releases reservation when no other active hold remains (doc 04 Release Reservation).
 */
export async function releaseApartmentsIfUnheld(
  tx: TransactionClient,
  apartmentIds: string[],
  excludeDealId: string,
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

    await tx.apartment.updateMany({
      where: { id: apartmentId, status: 'RESERVED' },
      data: { status: 'AVAILABLE' },
    });
  }
}

export async function setApartmentsStatus(
  tx: TransactionClient,
  apartmentIds: string[],
  status: ApartmentStatus,
): Promise<void> {
  if (apartmentIds.length === 0) {
    return;
  }
  await tx.apartment.updateMany({
    where: { id: { in: apartmentIds } },
    data: { status },
  });
}

export function statusChangeBody(from: DealStage, to: DealStage): string {
  return `${from}→${to}`;
}
