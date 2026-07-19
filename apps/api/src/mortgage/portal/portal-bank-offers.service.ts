import { Injectable } from "@nestjs/common";
import type { BankOfferListItem, BankOfferListResponse } from "@toonexpo/contracts";
import { PublicationStatus, type Prisma } from "@toonexpo/db";

import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { toBankOfferListItem } from "../mappers/bank-offer.mapper.js";
import {
  requireBankPartnerForCompany,
  requireOwnedBankOffer,
} from "../utils/bank-offer-access.js";
import type { PortalCreateBankOfferDto } from "./dto/portal-bank-offer.dto.js";
import type { PortalUpdateBankOfferDto } from "./dto/portal-bank-offer.dto.js";

@Injectable()
export class PortalBankOffersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(member: CompanyMemberContext): Promise<BankOfferListResponse> {
    const partner = await requireBankPartnerForCompany(
      this.prisma.db,
      member.companyId,
    );

    const offers = await this.prisma.db.bankOffer.findMany({
      where: { partnerCompanyId: partner.id },
      orderBy: [
        { featured: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    return { data: offers.map((offer) => toBankOfferListItem(offer)) };
  }

  async create(
    member: CompanyMemberContext,
    userId: string,
    dto: PortalCreateBankOfferDto,
  ): Promise<BankOfferListItem> {
    const partner = await requireBankPartnerForCompany(
      this.prisma.db,
      member.companyId,
    );

    const offer = await this.prisma.db.bankOffer.create({
      data: this.buildCreateData(partner.id, userId, dto),
    });

    return toBankOfferListItem(offer);
  }

  async update(
    member: CompanyMemberContext,
    offerId: string,
    userId: string,
    dto: PortalUpdateBankOfferDto,
  ): Promise<BankOfferListItem> {
    const partner = await requireBankPartnerForCompany(
      this.prisma.db,
      member.companyId,
    );
    await requireOwnedBankOffer(this.prisma.db, partner.id, offerId);

    const offer = await this.prisma.db.bankOffer.update({
      where: { id: offerId },
      data: this.buildUpdateData(userId, dto),
    });

    return toBankOfferListItem(offer);
  }

  async remove(member: CompanyMemberContext, offerId: string): Promise<void> {
    const partner = await requireBankPartnerForCompany(
      this.prisma.db,
      member.companyId,
    );
    await requireOwnedBankOffer(this.prisma.db, partner.id, offerId);
    await this.prisma.db.bankOffer.delete({ where: { id: offerId } });
  }

  private buildCreateData(
    partnerCompanyId: string,
    userId: string,
    dto: PortalCreateBankOfferDto,
  ): Prisma.BankOfferCreateInput {
    return {
      partnerCompany: { connect: { id: partnerCompanyId } },
      title: dto.title.trim(),
      shortDescription: dto.shortDescription?.trim() || null,
      rate: dto.rate,
      apr: dto.apr ?? null,
      minDownPaymentPercent: dto.minDownPaymentPercent,
      termOptionsYears: dto.termOptionsYears,
      fees: dto.fees?.trim() || null,
      calculationNotes: dto.calculationNotes?.trim() || null,
      featured: dto.featured ?? false,
      sortOrder: dto.sortOrder ?? 0,
      publicationStatus: PublicationStatus.draft,
      createdBy: { connect: { id: userId } },
    };
  }

  private buildUpdateData(
    userId: string,
    dto: PortalUpdateBankOfferDto,
  ): Prisma.BankOfferUpdateInput {
    return {
      updatedBy: { connect: { id: userId } },
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.shortDescription !== undefined
        ? { shortDescription: dto.shortDescription?.trim() || null }
        : {}),
      ...(dto.rate !== undefined ? { rate: dto.rate } : {}),
      ...(dto.apr !== undefined ? { apr: dto.apr ?? null } : {}),
      ...(dto.minDownPaymentPercent !== undefined
        ? { minDownPaymentPercent: dto.minDownPaymentPercent }
        : {}),
      ...(dto.termOptionsYears !== undefined
        ? { termOptionsYears: dto.termOptionsYears }
        : {}),
      ...(dto.fees !== undefined ? { fees: dto.fees?.trim() || null } : {}),
      ...(dto.calculationNotes !== undefined
        ? { calculationNotes: dto.calculationNotes?.trim() || null }
        : {}),
      ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
      ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
    };
  }
}
