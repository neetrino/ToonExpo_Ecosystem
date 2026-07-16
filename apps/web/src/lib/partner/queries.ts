import type { PartnerType, PublicationStatus } from '@toonexpo/domain';

import { prisma } from '@toonexpo/db';

export type PartnerCabinetBankOffer = {
  id: string;
  title: string;
  description: string | null;
  interestRate: number;
  minDownPaymentPercent: number;
  maxTermMonths: number;
  maxAmountAmd: number | null;
  featured: boolean;
  status: PublicationStatus;
  updatedAt: Date;
};

export type PartnerCabinetDetail = {
  id: string;
  name: string;
  slug: string;
  type: PartnerType;
  logoUrl: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  serviceCategories: string[];
  status: PublicationStatus;
  bankOffers: PartnerCabinetBankOffer[];
};

/** Loads the partner cabinet detail scoped by partnerId (caller must authorize). */
export async function loadOwnPartnerDetail(
  partnerId: string,
): Promise<PartnerCabinetDetail | null> {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      logoUrl: true,
      description: true,
      phone: true,
      email: true,
      website: true,
      serviceCategories: true,
      status: true,
      bankOffers: {
        orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
        select: {
          id: true,
          title: true,
          description: true,
          interestRate: true,
          minDownPaymentPercent: true,
          maxTermMonths: true,
          maxAmountAmd: true,
          featured: true,
          status: true,
          updatedAt: true,
        },
      },
    },
  });

  return partner;
}
