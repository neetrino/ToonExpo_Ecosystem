import { BadRequestException } from '@nestjs/common';
import {
  ApartmentSalesStatus,
  CrmDealApartmentLinkType,
  CrmDealStatus,
  CrmStatusSource,
  type Prisma,
  type PrismaClient,
} from '@toonexpo/db';

export const CRM_APARTMENT_RESERVED_BY_OTHER_DEAL = 'Apartment is already reserved by another deal';
export const CRM_APARTMENT_ALREADY_SOLD = 'Apartment is already sold';
export const CRM_DEAL_ALREADY_HAS_APARTMENT = 'Deal already has a linked apartment';

export type CrmInventoryClient = PrismaClient | Prisma.TransactionClient;

export type ApartmentHoldState = {
  salesStatus: ApartmentSalesStatus;
  activeCrmDealId: string | null;
};

export type CrmApartmentSalesWriteInput = {
  apartmentId: string;
  previous: ApartmentSalesStatus;
  next: ApartmentSalesStatus;
  dealId: string;
  actorUserId: string;
  linkType: CrmDealApartmentLinkType;
  clearActiveDeal?: boolean;
};

/**
 * Linked apartments are reserved until the deal is converted (sold).
 */
export const inventorySalesStatusForDeal = (dealStatus: CrmDealStatus): ApartmentSalesStatus =>
  dealStatus === CrmDealStatus.converted
    ? ApartmentSalesStatus.sold
    : ApartmentSalesStatus.reserved;

/**
 * Inverse mapping used when an admin sets inventory by hand.
 * Available releases the CRM hold by resetting the deal.
 */
export const dealStatusForManualInventory = (status: ApartmentSalesStatus): CrmDealStatus => {
  if (status === ApartmentSalesStatus.sold) {
    return CrmDealStatus.converted;
  }
  if (status === ApartmentSalesStatus.reserved) {
    return CrmDealStatus.reserved;
  }
  return CrmDealStatus.new_request;
};

export const linkTypeForInventoryStatus = (
  status: ApartmentSalesStatus,
): CrmDealApartmentLinkType => {
  if (status === ApartmentSalesStatus.sold) {
    return CrmDealApartmentLinkType.sold;
  }
  if (status === ApartmentSalesStatus.reserved) {
    return CrmDealApartmentLinkType.reserved;
  }
  return CrmDealApartmentLinkType.interest;
};

export const isApartmentInventorySynced = (
  apartment: ApartmentHoldState,
  dealId: string,
  next: ApartmentSalesStatus,
): boolean => apartment.salesStatus === next && apartment.activeCrmDealId === dealId;

export const shouldReleaseCrmReservation = (to: CrmDealStatus): boolean =>
  to === CrmDealStatus.lost || to === CrmDealStatus.closed || to === CrmDealStatus.new_request;

/**
 * Blocks linking / reserving when another deal already holds the unit.
 */
export const assertApartmentReservableByDeal = (
  apartment: ApartmentHoldState,
  dealId: string,
): void => {
  if (apartment.salesStatus === ApartmentSalesStatus.sold) {
    throw new BadRequestException(CRM_APARTMENT_ALREADY_SOLD);
  }
  if (
    apartment.salesStatus === ApartmentSalesStatus.reserved &&
    apartment.activeCrmDealId != null &&
    apartment.activeCrmDealId !== dealId
  ) {
    throw new BadRequestException(CRM_APARTMENT_RESERVED_BY_OTHER_DEAL);
  }
};

/**
 * Writes apartment sales status, history, and the deal-apartment link type.
 */
export const applyCrmApartmentSalesWrite = async (
  db: CrmInventoryClient,
  input: CrmApartmentSalesWriteInput,
): Promise<void> => {
  await db.apartment.update({
    where: { id: input.apartmentId },
    data: {
      salesStatus: input.next,
      crmStatusSource: CrmStatusSource.crm,
      activeCrmDealId: input.clearActiveDeal ? null : input.dealId,
      lastStatusChangedAt: new Date(),
      lastStatusChangedByUserId: input.actorUserId,
    },
  });
  await db.apartmentStatusHistory.create({
    data: {
      apartmentId: input.apartmentId,
      previousStatus: input.previous,
      newStatus: input.next,
      changedByUserId: input.actorUserId,
      linkedDealId: input.dealId,
      reason: `crm_status:${input.next}`,
    },
  });
  await db.crmDealApartmentLink.updateMany({
    where: {
      crmDealId: input.dealId,
      apartmentId: input.apartmentId,
    },
    data: { linkType: input.linkType },
  });
};
