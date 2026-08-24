import type {
  BankPartnerOfferTemplateItem,
  ProjectBankPartnerOfferItem,
} from '@toonexpo/contracts';

export const PENDING_BANK_PARTNER_OFFER_ID_PREFIX = 'pending:';

export const pendingBankPartnerOfferId = (templateId: string): string =>
  `${PENDING_BANK_PARTNER_OFFER_ID_PREFIX}${templateId}`;

export const isPendingBankPartnerOfferId = (offerId: string): boolean =>
  offerId.startsWith(PENDING_BANK_PARTNER_OFFER_ID_PREFIX);

export const templateIdFromPendingBankPartnerOfferId = (offerId: string): string =>
  offerId.slice(PENDING_BANK_PARTNER_OFFER_ID_PREFIX.length);

/** Staged import — visible in admin UI but not persisted until Save changes. */
export const templateToPendingBankPartnerOffer = (
  template: BankPartnerOfferTemplateItem,
  projectId: string,
): ProjectBankPartnerOfferItem => ({
  id: pendingBankPartnerOfferId(template.id),
  projectId,
  templateId: template.id,
  partnerCompanyId: template.partnerCompanyId,
  partnerCompanyName: template.partnerCompanyName,
  partnerCompanyLogoUrl: template.partnerCompanyLogoUrl,
  name: template.name,
  fields: template.fields,
  sortOrder: template.sortOrder,
  createdByUserId: '',
  updatedByUserId: null,
  createdAt: '',
  updatedAt: '',
});
