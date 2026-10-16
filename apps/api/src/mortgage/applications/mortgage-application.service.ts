import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateMortgageApplicationResult,
  PortalMortgageApplicationListResponse,
} from '@toonexpo/contracts';
import { PartnerCompanyStatus, PartnerCompanyType, PublicationStatus } from '@toonexpo/db';

import type { CompanyMemberContext } from '../../company/types/company-member-context.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { calculateMortgagePayment } from '../calculator/mortgage-calculator.util.js';
import { requireBankPartnerForCompany } from '../utils/bank-offer-access.js';
import type { CreateMortgageApplicationDto } from '../public/dto/create-mortgage-application.dto.js';

@Injectable()
export class MortgageApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    buyerUserId: string,
    dto: CreateMortgageApplicationDto,
  ): Promise<CreateMortgageApplicationResult> {
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
      include: { partnerCompany: { select: { name: true } } },
    });

    if (!offer) {
      throw new NotFoundException('Bank offer not found');
    }

    const estimate = calculateMortgagePayment(dto, offer);
    const note = dto.note?.trim();
    const created = await this.prisma.db.mortgageApplication.create({
      data: {
        bankOfferId: offer.id,
        buyerUserId,
        propertyPrice: dto.propertyPrice,
        downPaymentPercent: estimate.downPaymentPercent,
        loanTermYears: dto.loanTermYears,
        monthlyPayment: estimate.monthlyPayment,
        loanAmount: estimate.loanAmount,
        note: note ? note : null,
      },
    });

    return { id: created.id };
  }

  async listForPartner(
    member: CompanyMemberContext,
  ): Promise<PortalMortgageApplicationListResponse> {
    const partner = await requireBankPartnerForCompany(this.prisma.db, member.companyId);
    const rows = await this.prisma.db.mortgageApplication.findMany({
      where: { bankOffer: { partnerCompanyId: partner.id } },
      include: {
        bankOffer: { select: { title: true } },
        buyer: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: rows.map((row) => ({
        id: row.id,
        offerTitle: row.bankOffer.title,
        buyerName: row.buyer.name,
        buyerEmail: row.buyer.email,
        buyerPhone: row.buyer.phone,
        propertyPrice: row.propertyPrice,
        downPaymentPercent: row.downPaymentPercent.toString(),
        loanTermYears: row.loanTermYears,
        monthlyPayment: row.monthlyPayment,
        loanAmount: row.loanAmount,
        note: row.note,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }
}
