import {
  publicBankOfferSchema,
  publicPartnerDetailSchema,
  publicPartnerSummarySchema,
  type PublicBankOffer,
  type PublicPartnerDetail,
  type PublicPartnerSummary,
} from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';
import type { PartnerType } from '@toonexpo/domain';

import { parsePartnerTypeFilter } from './partner-type-filter';

const IS_DEV = process.env.NODE_ENV === 'development';

export type PublicBankOfferListing = PublicBankOffer & {
  partnerName: string;
  partnerSlug: string;
  partnerLogoUrl: string | null;
};

type PartnerSummaryRow = {
  id: string;
  name: string;
  slug: string;
  type: PartnerType;
  logoUrl: string | null;
  description: string | null;
};

type BankOfferRow = {
  id: string;
  title: string;
  description: string | null;
  interestRate: number;
  minDownPaymentPercent: number;
  maxTermMonths: number;
  maxAmountAmd: number | null;
  featured: boolean;
};

type PartnerDetailRow = PartnerSummaryRow & {
  phone: string | null;
  email: string | null;
  website: string | null;
  serviceCategories: string[];
  bankOffers: BankOfferRow[];
};

type BankOfferListingRow = BankOfferRow & {
  partner: {
    name: string;
    slug: string;
    logoUrl: string | null;
  };
};

function mapBankOffer(row: BankOfferRow): PublicBankOffer {
  const offer: PublicBankOffer = {
    id: row.id,
    title: row.title,
    description: row.description,
    interestRate: row.interestRate,
    minDownPaymentPercent: row.minDownPaymentPercent,
    maxTermMonths: row.maxTermMonths,
    maxAmountAmd: row.maxAmountAmd,
    featured: row.featured,
  };
  return IS_DEV ? publicBankOfferSchema.parse(offer) : offer;
}

function mapPartnerSummary(row: PartnerSummaryRow): PublicPartnerSummary {
  const summary: PublicPartnerSummary = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    logoUrl: row.logoUrl,
    description: row.description,
  };
  return IS_DEV ? publicPartnerSummarySchema.parse(summary) : summary;
}

function mapPartnerDetail(row: PartnerDetailRow): PublicPartnerDetail {
  const detail: PublicPartnerDetail = {
    ...mapPartnerSummary(row),
    phone: row.phone,
    email: row.email,
    website: row.website,
    serviceCategories: row.serviceCategories,
    bankOffers: row.bankOffers.map(mapBankOffer),
  };
  return IS_DEV ? publicPartnerDetailSchema.parse(detail) : detail;
}

function mapBankOfferListing(row: BankOfferListingRow): PublicBankOfferListing {
  return {
    ...mapBankOffer(row),
    partnerName: row.partner.name,
    partnerSlug: row.partner.slug,
    partnerLogoUrl: row.partner.logoUrl,
  };
}

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

/** Returns published partners ordered by name; optional validated type filter. */
export async function getPublishedPartners(typeFilter?: string): Promise<PublicPartnerSummary[]> {
  const type = parsePartnerTypeFilter(typeFilter);
  const rows = await prisma.partner.findMany({
    where: {
      status: 'PUBLISHED',
      ...(type ? { type } : {}),
    },
    orderBy: { name: 'asc' },
    select: partnerSummarySelect,
  });

  return rows.map(mapPartnerSummary);
}

/** Returns a published partner by slug, or null if missing or not published. */
export async function getPublishedPartnerBySlug(slug: string): Promise<PublicPartnerDetail | null> {
  const row = await prisma.partner.findFirst({
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

  if (!row) {
    return null;
  }

  return mapPartnerDetail(row);
}

/** Returns published bank offers from published bank partners. */
export async function getPublishedBankOffers(): Promise<PublicBankOfferListing[]> {
  const rows = await prisma.bankOffer.findMany({
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

  return rows.map(mapBankOfferListing);
}
