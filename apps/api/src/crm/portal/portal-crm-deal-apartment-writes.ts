import {
  ApartmentSalesStatus,
  CrmActivityStatus,
  CrmActivityType,
  CrmDealApartmentLinkType,
  type PriceVisibility,
  type Prisma,
} from "@toonexpo/db";

import { toApartmentLinkCreateData } from "../intake/intake.helpers.js";
import {
  applyCrmApartmentSalesWrite,
  isApartmentInventorySynced,
  linkTypeForInventoryStatus,
} from "../status/crm-inventory-sync.js";

const ATTACH_ACTIVITY_TITLE = "Apartment linked to deal";
const DETACH_ACTIVITY_TITLE = "Apartment unlinked from deal";

export type DealApartmentDealRow = {
  id: string;
  projectId: string | null;
};

export type DealApartmentOwnedRow = {
  id: string;
  number: string;
  projectId: string;
  salesStatus: ApartmentSalesStatus;
  activeCrmDealId: string | null;
  price: Prisma.Decimal | null;
  priceVisibility: PriceVisibility;
};

export type DealApartmentLinkRow = {
  id: string;
  apartmentId: string;
  apartment: {
    number: string;
    salesStatus: ApartmentSalesStatus;
    activeCrmDealId: string | null;
  };
};

/**
 * Upserts the link and reserves/sells the apartment for this deal.
 */
export const persistDealApartmentAttach = (
  tx: Prisma.TransactionClient,
  input: {
    deal: DealApartmentDealRow;
    apartment: DealApartmentOwnedRow;
    actorUserId: string;
    existingCount: number;
    nextStatus: ApartmentSalesStatus;
  },
) => {
  const linkData = toApartmentLinkCreateData({
    apartmentId: input.apartment.id,
    createdByUserId: input.actorUserId,
    salesStatus: input.apartment.salesStatus,
    price: input.apartment.price,
    priceVisibility: input.apartment.priceVisibility,
  });
  return upsertLinkedApartment(tx, input, linkData);
};

const upsertLinkedApartment = async (
  tx: Prisma.TransactionClient,
  input: {
    deal: DealApartmentDealRow;
    apartment: DealApartmentOwnedRow;
    actorUserId: string;
    existingCount: number;
    nextStatus: ApartmentSalesStatus;
  },
  linkData: ReturnType<typeof toApartmentLinkCreateData>,
) => {
  const upserted = await tx.crmDealApartmentLink.upsert({
    where: {
      crmDealId_apartmentId: {
        crmDealId: input.deal.id,
        apartmentId: input.apartment.id,
      },
    },
    create: {
      crmDealId: input.deal.id,
      ...linkData,
      isPrimary: input.existingCount === 0,
    },
    update: {},
    include: { apartment: { select: { number: true } } },
  });
  await writeLinkActivity(tx, {
    dealId: input.deal.id,
    actorUserId: input.actorUserId,
    title: ATTACH_ACTIVITY_TITLE,
    apartmentNumber: input.apartment.number,
  });
  await tx.crmDeal.update({
    where: { id: input.deal.id },
    data: {
      lastActivityAt: new Date(),
      ...(input.deal.projectId == null
        ? { projectId: input.apartment.projectId }
        : {}),
    },
  });
  await syncLinkedApartmentInventory(tx, input);
  return upserted;
};

const syncLinkedApartmentInventory = async (
  tx: Prisma.TransactionClient,
  input: {
    deal: DealApartmentDealRow;
    apartment: DealApartmentOwnedRow;
    actorUserId: string;
    nextStatus: ApartmentSalesStatus;
  },
): Promise<void> => {
  if (isApartmentInventorySynced(input.apartment, input.deal.id, input.nextStatus)) {
    return;
  }
  await applyCrmApartmentSalesWrite(tx, {
    apartmentId: input.apartment.id,
    previous: input.apartment.salesStatus,
    next: input.nextStatus,
    dealId: input.deal.id,
    actorUserId: input.actorUserId,
    linkType: linkTypeForInventoryStatus(input.nextStatus),
  });
};

/**
 * Releases a CRM reservation then deletes the apartment link.
 */
export const persistDealApartmentDetach = async (
  tx: Prisma.TransactionClient,
  input: {
    dealId: string;
    actorUserId: string;
    link: DealApartmentLinkRow;
  },
): Promise<void> => {
  await releaseLinkedReservation(tx, input);
  await tx.crmDealApartmentLink.delete({ where: { id: input.link.id } });
  await writeLinkActivity(tx, {
    dealId: input.dealId,
    actorUserId: input.actorUserId,
    title: DETACH_ACTIVITY_TITLE,
    apartmentNumber: input.link.apartment.number,
  });
  await tx.crmDeal.update({
    where: { id: input.dealId },
    data: { lastActivityAt: new Date() },
  });
};

const releaseLinkedReservation = async (
  tx: Prisma.TransactionClient,
  input: { dealId: string; actorUserId: string; link: DealApartmentLinkRow },
): Promise<void> => {
  if (
    input.link.apartment.activeCrmDealId !== input.dealId ||
    input.link.apartment.salesStatus !== ApartmentSalesStatus.reserved
  ) {
    return;
  }
  await applyCrmApartmentSalesWrite(tx, {
    apartmentId: input.link.apartmentId,
    previous: input.link.apartment.salesStatus,
    next: ApartmentSalesStatus.available,
    dealId: input.dealId,
    actorUserId: input.actorUserId,
    linkType: CrmDealApartmentLinkType.interest,
    clearActiveDeal: true,
  });
};

const writeLinkActivity = async (
  tx: Prisma.TransactionClient,
  input: {
    dealId: string;
    actorUserId: string;
    title: string;
    apartmentNumber: string;
  },
): Promise<void> => {
  await tx.crmFollowUpActivity.create({
    data: {
      crmDealId: input.dealId,
      type: CrmActivityType.status_update,
      title: input.title,
      description: `Apartment: ${input.apartmentNumber}`,
      status: CrmActivityStatus.done,
      createdByUserId: input.actorUserId,
      completedAt: new Date(),
    },
  });
};
