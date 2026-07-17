import { Inject, Injectable } from '@nestjs/common';
import type {
  PublicBankOffer,
  PublicPartnerDetail,
  PublicPartnerSummary,
} from '@toonexpo/contracts';
import type { PartnerType } from '@toonexpo/domain';

import { PrismaService } from '../../common/prisma.service';
import {
  mapBankOffer,
  mapPartnerDetail,
  mapPartnerSummary,
} from './catalog.mapper';

export type PublicBankOfferListing = PublicBankOffer & {
  partnerName: string;
  partnerSlug: string;
  partnerLogoUrl: string | null;
};

const partnerSummarySelect = {
  id: true,
  name: true,
  slug: true,
  type: true,
  logoUrl: true,
  description: true,
} as const;

const publishedBankOfferSelect = {
  id: true,
  title: true,
  description: true,
  interestRate: true,
  minDownPaymentPercent: true,
  maxTermMonths: true,
  maxAmountAmd: true,
  featured: true,
} as const;

@Injectable()
export class CatalogPartnersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(type?: PartnerType): Promise<PublicPartnerSummary[]> {
    const rows = await this.prisma.client.partner.findMany({
      where: {
        status: 'PUBLISHED',
        ...(type ? { type } : {}),
      },
      orderBy: { name: 'asc' },
      select: partnerSummarySelect,
    });
    return rows.map(mapPartnerSummary);
  }

  async detail(slug: string): Promise<PublicPartnerDetail | null> {
    const row = await this.prisma.client.partner.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: {
        ...partnerSummarySelect,
        phone: true,
        email: true,
        website: true,
        serviceCategories: true,
        bankOffers: {
          where: { status: 'PUBLISHED' },
          orderBy: [{ featured: 'desc' }, { interestRate: 'asc' }],
          select: publishedBankOfferSelect,
        },
      },
    });
    return row ? mapPartnerDetail(row) : null;
  }

  async bankOffers(): Promise<PublicBankOfferListing[]> {
    const rows = await this.prisma.client.bankOffer.findMany({
      where: {
        status: 'PUBLISHED',
        partner: { status: 'PUBLISHED', type: 'BANK' },
      },
      orderBy: [{ featured: 'desc' }, { interestRate: 'asc' }],
      select: {
        ...publishedBankOfferSelect,
        partner: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });
    return rows.map((row) => ({
      ...mapBankOffer(row),
      partnerName: row.partner.name,
      partnerSlug: row.partner.slug,
      partnerLogoUrl: row.partner.logoUrl,
    }));
  }
}
