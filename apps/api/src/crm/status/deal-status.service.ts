import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ApartmentSalesStatus,
  CrmDealApartmentLinkType,
  CrmDealStatus,
  CrmStatusSource,
  CompanyMemberStatus,
} from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { AnalyticsService } from "../../analytics/analytics.service.js";
import { CRM_STATUSES_REQUIRING_APARTMENT } from "../crm.constants.js";
import { isCrmStatusTransitionAllowed } from "./deal-status.transitions.js";

/**
 * Validates CRM status transitions and syncs apartment inventory.
 */
@Injectable()
export class DealStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  async applyStatusChange(input: {
    dealId: string;
    companyId: string;
    from: CrmDealStatus;
    to: CrmDealStatus;
    lostReason?: string | null;
    actorUserId: string;
  }): Promise<void> {
    if (!isCrmStatusTransitionAllowed(input.from, input.to)) {
      throw new BadRequestException(
        `Invalid status transition: ${input.from} -> ${input.to}`,
      );
    }
    if (input.to === CrmDealStatus.lost && !input.lostReason?.trim()) {
      throw new BadRequestException("lostReason is required when status is lost");
    }

    const linkCount = await this.prisma.db.crmDealApartmentLink.count({
      where: { crmDealId: input.dealId },
    });
    if (
      CRM_STATUSES_REQUIRING_APARTMENT.includes(input.to) &&
      linkCount === 0
    ) {
      throw new BadRequestException(
        `Status ${input.to} requires at least one linked apartment`,
      );
    }

    await this.prisma.db.crmDeal.update({
      where: { id: input.dealId },
      data: {
        status: input.to,
        ...(input.to === CrmDealStatus.lost
          ? { lostReason: input.lostReason ?? null }
          : {}),
        lastActivityAt: new Date(),
      },
    });

    await this.syncInventory(input);

    this.analytics.track({
      eventType: "crm_status_changed",
      crmDealId: input.dealId,
      companyId: input.companyId,
      actorUserId: input.actorUserId,
      metadata: { from: input.from, to: input.to },
    });
  }

  async assertAssigneeInCompany(
    companyId: string,
    assignedUserId: string,
  ): Promise<void> {
    const membership = await this.prisma.db.companyMember.findFirst({
      where: {
        companyId,
        userId: assignedUserId,
        status: CompanyMemberStatus.active,
      },
      select: { id: true },
    });
    if (!membership) {
      throw new BadRequestException(
        "Assignee must be an active member of this company",
      );
    }
  }

  private async syncInventory(input: {
    dealId: string;
    companyId: string;
    from: CrmDealStatus;
    to: CrmDealStatus;
    actorUserId: string;
  }): Promise<void> {
    if (input.to === CrmDealStatus.reserved) {
      await this.reservePrimaryApartment(input);
      return;
    }
    if (input.to === CrmDealStatus.converted) {
      await this.markPrimaryApartmentSold(input);
      return;
    }
    if (
      input.from === CrmDealStatus.reserved &&
      (input.to === CrmDealStatus.lost || input.to === CrmDealStatus.closed)
    ) {
      await this.releaseReservation(input);
    }
  }

  private async loadPrimaryApartmentId(dealId: string): Promise<string> {
    const link = await this.prisma.db.crmDealApartmentLink.findFirst({
      where: { crmDealId: dealId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      select: { apartmentId: true },
    });
    if (!link) {
      throw new BadRequestException("Deal has no linked apartment");
    }
    return link.apartmentId;
  }

  private async reservePrimaryApartment(input: {
    dealId: string;
    actorUserId: string;
  }): Promise<void> {
    const apartmentId = await this.loadPrimaryApartmentId(input.dealId);
    const apartment = await this.prisma.db.apartment.findUnique({
      where: { id: apartmentId },
      select: {
        salesStatus: true,
        activeCrmDealId: true,
      },
    });
    if (!apartment) {
      throw new NotFoundException("Apartment not found");
    }
    if (
      apartment.salesStatus === ApartmentSalesStatus.reserved &&
      apartment.activeCrmDealId &&
      apartment.activeCrmDealId !== input.dealId
    ) {
      throw new BadRequestException(
        "Apartment is already reserved by another deal",
      );
    }
    if (apartment.salesStatus === ApartmentSalesStatus.sold) {
      throw new BadRequestException("Apartment is already sold");
    }
    await this.writeApartmentStatus({
      apartmentId,
      previous: apartment.salesStatus,
      next: ApartmentSalesStatus.reserved,
      dealId: input.dealId,
      actorUserId: input.actorUserId,
      linkType: CrmDealApartmentLinkType.reserved,
    });
  }

  private async markPrimaryApartmentSold(input: {
    dealId: string;
    actorUserId: string;
  }): Promise<void> {
    const apartmentId = await this.loadPrimaryApartmentId(input.dealId);
    const apartment = await this.prisma.db.apartment.findUnique({
      where: { id: apartmentId },
      select: { salesStatus: true },
    });
    if (!apartment) {
      throw new NotFoundException("Apartment not found");
    }
    await this.writeApartmentStatus({
      apartmentId,
      previous: apartment.salesStatus,
      next: ApartmentSalesStatus.sold,
      dealId: input.dealId,
      actorUserId: input.actorUserId,
      linkType: CrmDealApartmentLinkType.sold,
    });
  }

  private async releaseReservation(input: {
    dealId: string;
    actorUserId: string;
  }): Promise<void> {
    const links = await this.prisma.db.crmDealApartmentLink.findMany({
      where: { crmDealId: input.dealId },
      select: { apartmentId: true },
    });
    for (const link of links) {
      const apartment = await this.prisma.db.apartment.findUnique({
        where: { id: link.apartmentId },
        select: { salesStatus: true, activeCrmDealId: true },
      });
      if (
        !apartment ||
        apartment.activeCrmDealId !== input.dealId ||
        apartment.salesStatus !== ApartmentSalesStatus.reserved
      ) {
        continue;
      }
      await this.writeApartmentStatus({
        apartmentId: link.apartmentId,
        previous: apartment.salesStatus,
        next: ApartmentSalesStatus.available,
        dealId: input.dealId,
        actorUserId: input.actorUserId,
        linkType: CrmDealApartmentLinkType.interest,
        clearActiveDeal: true,
      });
    }
  }

  private async writeApartmentStatus(input: {
    apartmentId: string;
    previous: ApartmentSalesStatus;
    next: ApartmentSalesStatus;
    dealId: string;
    actorUserId: string;
    linkType: CrmDealApartmentLinkType;
    clearActiveDeal?: boolean;
  }): Promise<void> {
    await this.prisma.db.$transaction(async (tx) => {
      await tx.apartment.update({
        where: { id: input.apartmentId },
        data: {
          salesStatus: input.next,
          crmStatusSource: CrmStatusSource.crm,
          activeCrmDealId: input.clearActiveDeal ? null : input.dealId,
          lastStatusChangedAt: new Date(),
          lastStatusChangedByUserId: input.actorUserId,
        },
      });
      await tx.apartmentStatusHistory.create({
        data: {
          apartmentId: input.apartmentId,
          previousStatus: input.previous,
          newStatus: input.next,
          changedByUserId: input.actorUserId,
          linkedDealId: input.dealId,
          reason: `crm_status:${input.next}`,
        },
      });
      await tx.crmDealApartmentLink.updateMany({
        where: {
          crmDealId: input.dealId,
          apartmentId: input.apartmentId,
        },
        data: { linkType: input.linkType },
      });
    });
  }
}
