import { BadRequestException, Injectable } from "@nestjs/common";
import type { CrmApartmentLinkItem } from "@toonexpo/contracts";
import type { CrmDealStatus } from "@toonexpo/db";

import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { entityNotFound } from "../../portal/utils/access.js";
import { CRM_STATUSES_REQUIRING_APARTMENT } from "../crm.constants.js";
import { mapApartmentLinkItem } from "../mappers/crm.mapper.js";
import {
  assertApartmentReservableByDeal,
  inventorySalesStatusForDeal,
  isApartmentInventorySynced,
  linkTypeForInventoryStatus,
} from "../status/crm-inventory-sync.js";
import {
  persistDealApartmentAttach,
  persistDealApartmentDetach,
  type DealApartmentOwnedRow,
} from "./portal-crm-deal-apartment-writes.js";

type DealRow = { id: string; status: CrmDealStatus; projectId: string | null };

/**
 * Attach / detach apartments on an existing company CRM deal.
 */
@Injectable()
export class PortalCrmDealApartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async attach(
    member: CompanyMemberContext,
    dealId: string,
    actorUserId: string,
    apartmentId: string,
  ): Promise<CrmApartmentLinkItem> {
    const deal = await this.requireCompanyDeal(member.companyId, dealId);
    const apartment = await this.loadOwnedApartment(member.companyId, apartmentId);
    const nextStatus = inventorySalesStatusForDeal(deal.status);
    if (!isApartmentInventorySynced(apartment, deal.id, nextStatus)) {
      assertApartmentReservableByDeal(apartment, deal.id);
    }
    const existingCount = await this.prisma.db.crmDealApartmentLink.count({
      where: { crmDealId: deal.id },
    });
    const link = await this.prisma.db.$transaction((tx) =>
      persistDealApartmentAttach(tx, {
        deal,
        apartment,
        actorUserId,
        existingCount,
        nextStatus,
      }),
    );
    return mapApartmentLinkItem({
      ...link,
      linkType: linkTypeForInventoryStatus(nextStatus),
    });
  }

  async detach(
    member: CompanyMemberContext,
    dealId: string,
    actorUserId: string,
    apartmentId: string,
  ): Promise<void> {
    const deal = await this.requireCompanyDeal(member.companyId, dealId);
    const link = await this.loadDealApartmentLink(deal.id, apartmentId);
    await this.assertCanDetach(deal);
    await this.prisma.db.$transaction((tx) =>
      persistDealApartmentDetach(tx, { dealId: deal.id, actorUserId, link }),
    );
  }

  private async loadOwnedApartment(
    companyId: string,
    apartmentId: string,
  ): Promise<DealApartmentOwnedRow> {
    const apartment = await this.prisma.db.apartment.findFirst({
      where: {
        id: apartmentId,
        project: { builderCompanyId: companyId },
      },
      select: {
        id: true,
        number: true,
        projectId: true,
        salesStatus: true,
        activeCrmDealId: true,
        price: true,
        priceVisibility: true,
      },
    });
    if (!apartment) {
      throw entityNotFound("Apartment");
    }
    return apartment;
  }

  private async loadDealApartmentLink(dealId: string, apartmentId: string) {
    const link = await this.prisma.db.crmDealApartmentLink.findUnique({
      where: {
        crmDealId_apartmentId: { crmDealId: dealId, apartmentId },
      },
      include: {
        apartment: {
          select: { number: true, salesStatus: true, activeCrmDealId: true },
        },
      },
    });
    if (!link) {
      throw entityNotFound("Apartment link");
    }
    return link;
  }

  private async assertCanDetach(deal: DealRow): Promise<void> {
    const linkCount = await this.prisma.db.crmDealApartmentLink.count({
      where: { crmDealId: deal.id },
    });
    if (
      CRM_STATUSES_REQUIRING_APARTMENT.includes(deal.status) &&
      linkCount <= 1
    ) {
      throw new BadRequestException(
        `Cannot unlink the last apartment while status is ${deal.status}`,
      );
    }
  }

  private async requireCompanyDeal(
    companyId: string,
    dealId: string,
  ): Promise<DealRow> {
    const deal = await this.prisma.db.crmDeal.findFirst({
      where: { id: dealId, companyId },
      select: { id: true, status: true, projectId: true },
    });
    if (!deal) {
      throw entityNotFound("Deal");
    }
    return deal;
  }
}
