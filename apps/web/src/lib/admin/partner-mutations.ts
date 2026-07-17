import type {
  BankOfferStatusInput,
  BankOfferUpsertInput,
  PartnerStatusInput,
  PartnerUpsertInput,
} from '@toonexpo/contracts';

import type { AuditActor } from '@/lib/audit/record-audit';

import { adminApiRequest } from './admin-api';
import type { AdminMutationResult } from './mutation-result';

type PartnerResult = AdminMutationResult<{ partnerId: string; partnerSlug: string }>;
type BankOfferResult = AdminMutationResult<{ bankOfferId: string; partnerSlug: string }>;

export function createPartner(input: PartnerUpsertInput): Promise<PartnerResult> {
  return adminApiRequest('/commands/create-partner', { method: 'POST', body: input });
}

export function updatePartner(
  input: PartnerUpsertInput & { partnerId: string },
): Promise<PartnerResult> {
  return adminApiRequest('/commands/update-partner', { method: 'POST', body: input });
}

export function setPartnerStatus(
  input: PartnerStatusInput,
  _actor: AuditActor,
): Promise<PartnerResult> {
  return adminApiRequest('/commands/partner-status', { method: 'POST', body: input });
}

export function createBankOffer(input: BankOfferUpsertInput): Promise<BankOfferResult> {
  return adminApiRequest('/commands/create-bank-offer', { method: 'POST', body: input });
}

export function updateBankOffer(
  input: BankOfferUpsertInput & { bankOfferId: string },
): Promise<BankOfferResult> {
  return adminApiRequest('/commands/update-bank-offer', { method: 'POST', body: input });
}

export function setBankOfferStatus(
  input: BankOfferStatusInput,
  _actor: AuditActor,
): Promise<BankOfferResult> {
  return adminApiRequest('/commands/bank-offer-status', { method: 'POST', body: input });
}
