import type { PartnerType, PublicationStatus } from '@toonexpo/domain';

import { apiRequest } from '@/lib/api/client';

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

export async function loadOwnPartnerDetail(
  _partnerId: string,
): Promise<PartnerCabinetDetail | null> {
  const detail = await apiRequest<
    | (Omit<PartnerCabinetDetail, 'bankOffers'> & {
        bankOffers: Array<Omit<PartnerCabinetBankOffer, 'updatedAt'> & { updatedAt: string }>;
      })
    | null
  >('/partner/detail');
  return detail
    ? {
        ...detail,
        bankOffers: detail.bankOffers.map((offer) => ({
          ...offer,
          updatedAt: new Date(offer.updatedAt),
        })),
      }
    : null;
}
