import {
  CrmActivityStatus,
  CrmActivityType,
  CrmDealApartmentLinkType,
  CrmDealStatus,
  type ApartmentSalesStatus,
  type PriceVisibility,
  type RequestSource,
} from "@toonexpo/db";

import { CRM_OPEN_DEAL_STATUSES } from "../crm.constants.js";
import type { PrismaService } from "../../prisma/prisma.service.js";

type DbClient = PrismaService["db"];

/**
 * Finds an open CRM deal for the same builder company + buyer (dedup key).
 */
export const findOpenDealForBuyer = (
  db: DbClient,
  companyId: string,
  buyerProfileId: string,
): Promise<{ id: string; status: CrmDealStatus } | null> =>
  db.crmDeal.findFirst({
    where: {
      companyId,
      buyerProfileId,
      status: { in: [...CRM_OPEN_DEAL_STATUSES] },
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true, status: true },
  });

export type ApartmentLinkSnapshot = {
  apartmentId: string;
  salesStatus: ApartmentSalesStatus;
  price: import("@toonexpo/db").Prisma.Decimal | null;
  priceVisibility: PriceVisibility;
  createdByUserId: string | null;
};

/**
 * Builds apartment link create payload with inventory snapshot.
 */
export const toApartmentLinkCreateData = (input: ApartmentLinkSnapshot) => ({
  apartmentId: input.apartmentId,
  linkType: CrmDealApartmentLinkType.interest,
  isPrimary: true as const,
  apartmentSalesStatusAtLink: input.salesStatus,
  priceAtLink: input.price,
  priceVisibilityAtLink: input.priceVisibility,
  createdByUserId: input.createdByUserId,
});

export const DEDUP_ACTIVITY_TITLE = "Additional intake request attached";

export const toDedupActivityData = (input: {
  source: RequestSource;
  note: string | null | undefined;
  createdByUserId: string;
}) => ({
  type: CrmActivityType.status_update,
  title: DEDUP_ACTIVITY_TITLE,
  description: [
    `Source: ${input.source}`,
    input.note ? `Note: ${input.note}` : null,
  ]
    .filter(Boolean)
    .join("\n"),
  status: CrmActivityStatus.done,
  createdByUserId: input.createdByUserId,
  completedAt: new Date(),
});

export { CrmDealStatus };
