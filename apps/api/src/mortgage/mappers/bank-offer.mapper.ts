import type {
  BankOfferListItem,
  PublicMortgageOfferItem,
} from "@toonexpo/contracts";
import type { Prisma } from "@toonexpo/db";

const toIso = (value: Date): string => value.toISOString();

export const decimalToRequiredString = (
  value: Prisma.Decimal,
): string => value.toString();

export const decimalToOptionalString = (
  value: Prisma.Decimal | null,
): string | null => (value == null ? null : value.toString());

type BankOfferRecord = Prisma.BankOfferGetPayload<object>;

type BankOfferWithPartner = Prisma.BankOfferGetPayload<{
  include: {
    partnerCompany: {
      select: {
        id: true;
        name: true;
        slug: true;
        logoMediaId: true;
      };
    };
  };
}>;

export const toBankOfferListItem = (
  offer: BankOfferRecord,
  partnerCompanyName?: string,
): BankOfferListItem => ({
  id: offer.id,
  partnerCompanyId: offer.partnerCompanyId,
  ...(partnerCompanyName ? { partnerCompanyName } : {}),
  title: offer.title,
  shortDescription: offer.shortDescription,
  rate: decimalToRequiredString(offer.rate),
  apr: decimalToOptionalString(offer.apr),
  minDownPaymentPercent: decimalToRequiredString(offer.minDownPaymentPercent),
  termOptionsYears: offer.termOptionsYears,
  fees: offer.fees,
  calculationNotes: offer.calculationNotes,
  featured: offer.featured,
  sortOrder: offer.sortOrder,
  publicationStatus: offer.publicationStatus,
  createdByUserId: offer.createdByUserId,
  updatedByUserId: offer.updatedByUserId,
  publishedAt: offer.publishedAt ? toIso(offer.publishedAt) : null,
  createdAt: toIso(offer.createdAt),
  updatedAt: toIso(offer.updatedAt),
});

export const toPublicMortgageOfferItem = (
  offer: BankOfferWithPartner,
): PublicMortgageOfferItem => ({
  id: offer.id,
  title: offer.title,
  shortDescription: offer.shortDescription,
  rate: decimalToRequiredString(offer.rate),
  apr: decimalToOptionalString(offer.apr),
  minDownPaymentPercent: decimalToRequiredString(offer.minDownPaymentPercent),
  termOptionsYears: offer.termOptionsYears,
  fees: offer.fees,
  calculationNotes: offer.calculationNotes,
  featured: offer.featured,
  sortOrder: offer.sortOrder,
  bank: {
    id: offer.partnerCompany.id,
    name: offer.partnerCompany.name,
    slug: offer.partnerCompany.slug,
    logoMediaId: offer.partnerCompany.logoMediaId,
  },
});
