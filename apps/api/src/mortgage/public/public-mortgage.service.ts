import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  MortgageCalculatorResult,
  PublicMortgageOfferListResponse,
} from "@toonexpo/contracts";
import {
  PartnerCompanyStatus,
  PartnerCompanyType,
  PublicationStatus,
  type Prisma,
} from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { AnalyticsService } from "../../analytics/analytics.service.js";
import { calculateMortgagePayment } from "../calculator/mortgage-calculator.util.js";
import { toPublicMortgageOfferItem } from "../mappers/bank-offer.mapper.js";
import type { MortgageCalculatorDto } from "./dto/mortgage-calculator.dto.js";

const publicOfferInclude = {
  partnerCompany: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoMediaId: true,
      status: true,
      publicationStatus: true,
    },
  },
} satisfies Prisma.BankOfferInclude;

@Injectable()
export class PublicMortgageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  async listOffers(): Promise<PublicMortgageOfferListResponse> {
    const offers = await this.prisma.db.bankOffer.findMany({
      where: {
        publicationStatus: PublicationStatus.published,
        partnerCompany: {
          type: PartnerCompanyType.bank,
          status: PartnerCompanyStatus.active,
          publicationStatus: PublicationStatus.published,
        },
      },
      include: publicOfferInclude,
      orderBy: [
        { featured: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    this.analytics.track({ eventType: "mortgage_page_view" });

    return { data: offers.map(toPublicMortgageOfferItem) };
  }

  async calculate(dto: MortgageCalculatorDto): Promise<MortgageCalculatorResult> {
    const offer = await this.prisma.db.bankOffer.findFirst({
      where: {
        id: dto.bankOfferId,
        publicationStatus: PublicationStatus.published,
        partnerCompany: {
          type: PartnerCompanyType.bank,
          status: PartnerCompanyStatus.active,
          publicationStatus: PublicationStatus.published,
        },
      },
      include: {
        partnerCompany: { select: { name: true } },
      },
    });

    if (!offer) {
      throw new NotFoundException("Bank offer not found");
    }

    this.analytics.track({
      eventType: "bank_offer_selected",
      companyId: offer.partnerCompanyId,
      metadata: { offerId: offer.id },
    });

    return calculateMortgagePayment(dto, offer);
  }
}
