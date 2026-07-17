import type { BankOfferUpsertInput, PartnerSelfProfileInput } from '@toonexpo/contracts';

import type { AdminMutationResult } from '@/lib/admin/mutation-result';
import { serverApiRequest } from '@/lib/api/server';

export function updateOwnPartnerProfile(
  _partnerId: string,
  input: PartnerSelfProfileInput,
): Promise<AdminMutationResult<{ partnerId: string; partnerSlug: string }>> {
  return serverApiRequest('/partner/profile', { method: 'PATCH', body: input });
}

export function createOwnBankOffer(
  input: BankOfferUpsertInput,
): Promise<AdminMutationResult<{ bankOfferId: string; partnerSlug: string }>> {
  return serverApiRequest('/partner/bank-offers', { method: 'POST', body: input });
}

export function updateOwnBankOffer(
  input: BankOfferUpsertInput & { bankOfferId: string },
): Promise<AdminMutationResult<{ bankOfferId: string; partnerSlug: string }>> {
  return serverApiRequest(`/partner/bank-offers/${encodeURIComponent(input.bankOfferId)}`, {
    method: 'PATCH',
    body: input,
  });
}
