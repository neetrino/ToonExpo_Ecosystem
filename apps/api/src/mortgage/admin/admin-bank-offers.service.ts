import { Injectable } from "@nestjs/common";
import type { BankOfferListItem, BankOfferListResponse } from "@toonexpo/contracts";
import { PublicationStatus, type Prisma } from "@toonexpo/db";

import { WebRevalidationService } from "../../common/web-revalidation/web-revalidation.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { toBankOfferListItem } from "../mappers/bank-offer.mapper.js";
import {
  assertBankPartnerCompany,
  bankOfferNotFound,
} from "../utils/bank-offer-access.js";
import type { CreateBankOfferDto } from "./dto/admin-bank-offer.dto.js";
import type { ListAdminBankOffersQueryDto } from "./dto/admin-bank-offer.dto.js";
import type { UpdateBankOfferDto } from "./dto/admin-bank-offer.dto.js";

const bankOfferInclude = {
  partnerCompany: { select: { name: true } },
} satisfies Prisma.BankOfferInclude;

@Injectable()
export class AdminBankOffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webRevalidation: WebRevalidationService,
  ) {}

  async list(query: ListAdminBankOffersQueryDto): Promise<BankOfferListResponse> {
    const offers = await this.prisma.db.bankOffer.findMany({
      ...(query.partnerCompanyId
        ? { where: { partnerCompanyId: query.partnerCompanyId } }
        : {}),
      include: bankOfferInclude,
      orderBy: [
        { featured: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    return {
      data: offers.map((offer) =>
        toBankOfferListItem(offer, offer.partnerCompany.name),
      ),
    };
  }

  async getById(id: string): Promise<BankOfferListItem> {
    const offer = await this.prisma.db.bankOffer.findUnique({
      where: { id },
      include: bankOfferInclude,
    });

    if (!offer) {
      throw bankOfferNotFound();
    }

    return toBankOfferListItem(offer, offer.partnerCompany.name);
  }

  async create(
    userId: string,
    dto: CreateBankOfferDto,
  ): Promise<BankOfferListItem> {
    await assertBankPartnerCompany(this.prisma.db, dto.partnerCompanyId);

    const offer = await this.prisma.db.bankOffer.create({
      data: this.buildCreateData(userId, dto),
      include: bankOfferInclude,
    });

    if (
      (dto.publicationStatus ?? PublicationStatus.draft) ===
      PublicationStatus.published
    ) {
      this.webRevalidation.revalidateMortgage();
    }

    return toBankOfferListItem(offer, offer.partnerCompany.name);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateBankOfferDto,
  ): Promise<BankOfferListItem> {
    await this.requireOffer(id);

    const offer = await this.prisma.db.bankOffer.update({
      where: { id },
      data: this.buildUpdateData(userId, dto),
      include: bankOfferInclude,
    });

    if (dto.publicationStatus !== undefined) {
      this.webRevalidation.revalidateMortgage();
    }

    return toBankOfferListItem(offer, offer.partnerCompany.name);
  }

  async remove(id: string): Promise<void> {
    await this.requireOffer(id);
    await this.prisma.db.bankOffer.delete({ where: { id } });
  }

  private async requireOffer(id: string) {
    const offer = await this.prisma.db.bankOffer.findUnique({ where: { id } });
    if (!offer) {
      throw bankOfferNotFound();
    }
    return offer;
  }

  private buildCreateData(
    userId: string,
    dto: CreateBankOfferDto,
  ): Prisma.BankOfferCreateInput {
    const publicationStatus = dto.publicationStatus ?? PublicationStatus.draft;

    return {
      partnerCompany: { connect: { id: dto.partnerCompanyId } },
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
      publicationStatus,
      publishedAt:
        publicationStatus === PublicationStatus.published ? new Date() : null,
      createdBy: { connect: { id: userId } },
    };
  }

  private buildUpdateData(
    userId: string,
    dto: UpdateBankOfferDto,
  ): Prisma.BankOfferUpdateInput {
    const data: Prisma.BankOfferUpdateInput = {
      updatedBy: { connect: { id: userId } },
    };

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }
    if (dto.shortDescription !== undefined) {
      data.shortDescription = dto.shortDescription?.trim() || null;
    }
    if (dto.rate !== undefined) {
      data.rate = dto.rate;
    }
    if (dto.apr !== undefined) {
      data.apr = dto.apr;
    }
    if (dto.minDownPaymentPercent !== undefined) {
      data.minDownPaymentPercent = dto.minDownPaymentPercent;
    }
    if (dto.termOptionsYears !== undefined) {
      data.termOptionsYears = dto.termOptionsYears;
    }
    if (dto.fees !== undefined) {
      data.fees = dto.fees?.trim() || null;
    }
    if (dto.calculationNotes !== undefined) {
      data.calculationNotes = dto.calculationNotes?.trim() || null;
    }
    if (dto.featured !== undefined) {
      data.featured = dto.featured;
    }
    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }
    if (dto.publicationStatus !== undefined) {
      data.publicationStatus = dto.publicationStatus;
      data.publishedAt =
        dto.publicationStatus === PublicationStatus.published
          ? new Date()
          : null;
    }

    return data;
  }
}
