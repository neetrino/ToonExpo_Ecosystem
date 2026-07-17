import type { BankOfferUpsertInput, PartnerSelfProfileInput } from '@toonexpo/contracts';

import type { AdminMutationResult } from '@/lib/admin/mutation-result';
import { apiRequest } from '@/lib/api/client';

export function updateOwnPartnerProfile(
  _partnerId: string,
  input: PartnerSelfProfileInput,
): Promise<AdminMutationResult<{ partnerId: string; partnerSlug: string }>> {
  return apiRequest('/partner/profile', { method: 'PATCH', body: input });
}

export function createOwnBankOffer(
  input: BankOfferUpsertInput,
): Promise<AdminMutationResult<{ bankOfferId: string; partnerSlug: string }>> {
  return apiRequest('/partner/bank-offers', { method: 'POST', body: input });
}

export function updateOwnBankOffer(
  input: BankOfferUpsertInput & { bankOfferId: string },
): Promise<AdminMutationResult<{ bankOfferId: string; partnerSlug: string }>> {
  return apiRequest(`/partner/bank-offers/${encodeURIComponent(input.bankOfferId)}`, {
    method: 'PATCH',
    body: input,
  });
}
