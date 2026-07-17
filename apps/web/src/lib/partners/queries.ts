import {
  publicBankOfferSchema,
  publicPartnerDetailSchema,
  publicPartnerSummarySchema,
  type PublicBankOffer,
  type PublicPartnerDetail,
  type PublicPartnerSummary,
} from '@toonexpo/contracts';
import { z } from 'zod';

import { apiRequest, ApiClientError } from '@/lib/api';

export type PublicBankOfferListing = PublicBankOffer & {
  partnerName: string;
  partnerSlug: string;
  partnerLogoUrl: string | null;
};

const publicBankOfferListingSchema = publicBankOfferSchema.extend({
  partnerName: z.string(),
  partnerSlug: z.string(),
  partnerLogoUrl: z.string().nullable(),
});

/** Loads published partners from Nest with an optional validated type filter. */
export async function getPublishedPartners(typeFilter?: string): Promise<PublicPartnerSummary[]> {
  const search = new URLSearchParams();
  if (typeFilter) {
    search.set('type', typeFilter);
  }
  const suffix = search.size > 0 ? `?${search.toString()}` : '';
  const raw = await apiRequest<unknown>(`/catalog/partners${suffix}`);
  return z.array(publicPartnerSummarySchema).parse(raw);
}

/** Loads a published partner from Nest, or null when it does not exist. */
export async function getPublishedPartnerBySlug(slug: string): Promise<PublicPartnerDetail | null> {
  try {
    const raw = await apiRequest<unknown>(`/catalog/partners/${encodeURIComponent(slug)}`);
    return publicPartnerDetailSchema.parse(raw);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/** Loads published bank offers from published bank partners via Nest. */
export async function getPublishedBankOffers(): Promise<PublicBankOfferListing[]> {
  const raw = await apiRequest<unknown>('/catalog/bank-offers');
  return z.array(publicBankOfferListingSchema).parse(raw);
}
