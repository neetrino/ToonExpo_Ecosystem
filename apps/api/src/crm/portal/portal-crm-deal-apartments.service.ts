import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";
import type { CrmApartmentLinkItem } from "@toonexpo/contracts";
import {
  CrmActivityStatus,
  CrmActivityType,
  type CrmDealStatus,
} from "@toonexpo/db";

import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { entityNotFound } from "../../portal/utils/access.js";
import { CRM_STATUSES_REQUIRING_APARTMENT } from "../crm.constants.js";
import { toApartmentLinkCreateData } from "../intake/intake.helpers.js";
import { mapApartmentLinkItem } from "../mappers/crm.mapper.js";

const ATTACH_ACTIVITY_TITLE = "Apartment linked to deal";
const DETACH_ACTIVITY_TITLE = "Apartment unlinked from deal";

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
    const apartment = await this.prisma.db.apartment.findFirst({
      where: {
        id: apartmentId,
        project: { builderCompanyId: member.companyId },
      },
      select: {
        id: true,
        number: true,
        projectId: true,
        salesStatus: true,
        price: true,
        priceVisibility: true,
      },
    });
    if (!apartment) {
      throw entityNotFound("Apartment");
    }

    const existingCount = await this.prisma.db.crmDealApartmentLink.count({
      where: { crmDealId: deal.id },
    });
    const linkData = toApartmentLinkCreateData({
      apartmentId: apartment.id,
      createdByUserId: actorUserId,
      salesStatus: apartment.salesStatus,
      price: apartment.price,
      priceVisibility: apartment.priceVisibility,
    });

    const link = await this.prisma.db.$transaction(async (tx) => {
      const upserted = await tx.crmDealApartmentLink.upsert({
        where: {
          crmDealId_apartmentId: {
            crmDealId: deal.id,
            apartmentId: apartment.id,
          },
        },
        create: {
          crmDealId: deal.id,
          ...linkData,
          isPrimary: existingCount === 0,
        },
        update: {},
        include: { apartment: { select: { number: true } } },
      });

      await tx.crmFollowUpActivity.create({
        data: {
          crmDealId: deal.id,
          type: CrmActivityType.status_update,
          title: ATTACH_ACTIVITY_TITLE,
          description: `Apartment: ${apartment.number}`,
          status: CrmActivityStatus.done,
          createdByUserId: actorUserId,
          completedAt: new Date(),
        },
      });

      await tx.crmDeal.update({
        where: { id: deal.id },
        data: {
          lastActivityAt: new Date(),
          ...(deal.projectId == null
            ? { projectId: apartment.projectId }
            : {}),
        },
      });

      return upserted;
    });

    return mapApartmentLinkItem(link);
  }

  async detach(
    member: CompanyMemberContext,
    dealId: string,
    actorUserId: string,
    apartmentId: string,
  ): Promise<void> {
    const deal = await this.requireCompanyDeal(member.companyId, dealId);
    const link = await this.prisma.db.crmDealApartmentLink.findUnique({
      where: {
        crmDealId_apartmentId: {
          crmDealId: deal.id,
          apartmentId,
        },
      },
      include: { apartment: { select: { number: true } } },
    });
    if (!link) {
      throw entityNotFound("Apartment link");
    }

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

    await this.prisma.db.$transaction(async (tx) => {
      await tx.crmDealApartmentLink.delete({ where: { id: link.id } });
      await tx.crmFollowUpActivity.create({
        data: {
          crmDealId: deal.id,
          type: CrmActivityType.status_update,
          title: DETACH_ACTIVITY_TITLE,
          description: `Apartment: ${link.apartment.number}`,
          status: CrmActivityStatus.done,
          createdByUserId: actorUserId,
          completedAt: new Date(),
        },
      });
      await tx.crmDeal.update({
        where: { id: deal.id },
        data: { lastActivityAt: new Date() },
      });
    });
  }

  private async requireCompanyDeal(
    companyId: string,
    dealId: string,
  ): Promise<{ id: string; status: CrmDealStatus; projectId: string | null }> {
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
