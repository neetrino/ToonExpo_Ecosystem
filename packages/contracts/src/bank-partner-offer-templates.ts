/**
 * Bank partner offer templates (Admin Templates) and project-scoped copies.
 */

import type { PublicationStatus } from './catalog.js';

/** Same keys as project catalog Bank partner section. */
export const BANK_PARTNER_OFFER_FINANCE_KEYS = [
  'partnerBank',
  'parkingPrice',
  'paymentTypes',
  'installmentTerms',
  'mortgageTerms',
  'specialTerms',
  'specialTermsAvailable',
  'incomeTaxRefund',
  'subsidizedPrograms',
] as const;

export type BankPartnerOfferFinanceKey =
  (typeof BANK_PARTNER_OFFER_FINANCE_KEYS)[number];

export type BankPartnerOfferLocaleText = {
  hy: string;
  ru: string;
  en: string;
};

export type BankPartnerOfferFinanceFields = Partial<
  Record<BankPartnerOfferFinanceKey, BankPartnerOfferLocaleText>
>;

export type BankPartnerOfferTemplateItem = {
  id: string;
  partnerCompanyId: string | null;
  partnerCompanyName: string | null;
  partnerCompanyLogoUrl: string | null;
  name: string;
  fields: BankPartnerOfferFinanceFields;
  publicationStatus: PublicationStatus;
  sortOrder: number;
  createdByUserId: string;
  updatedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BankPartnerOfferTemplateListResponse = {
  data: BankPartnerOfferTemplateItem[];
};

export type CreateBankPartnerOfferTemplateBody = {
  name: string;
  fields?: BankPartnerOfferFinanceFields;
  publicationStatus?: PublicationStatus;
  sortOrder?: number;
};

export type UpdateBankPartnerOfferTemplateBody = {
  name?: string;
  fields?: BankPartnerOfferFinanceFields;
  publicationStatus?: PublicationStatus;
  sortOrder?: number;
};

export type ProjectBankPartnerOfferItem = {
  id: string;
  projectId: string;
  templateId: string | null;
  partnerCompanyId: string | null;
  partnerCompanyName: string | null;
  partnerCompanyLogoUrl: string | null;
  name: string;
  fields: BankPartnerOfferFinanceFields;
  sortOrder: number;
  createdByUserId: string;
  updatedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectBankPartnerOfferListResponse = {
  data: ProjectBankPartnerOfferItem[];
};

export type ApplyProjectBankPartnerOffersBody = {
  /** Apply specific templates (skips already-applied). */
  templateIds?: string[];
  /** Apply every published template not yet on the project. */
  addAll?: boolean;
};

export type ApplyProjectBankPartnerOffersResponse = {
  data: ProjectBankPartnerOfferItem[];
  appliedCount: number;
};

export type UpdateProjectBankPartnerOfferBody = {
  name?: string;
  fields?: BankPartnerOfferFinanceFields;
  sortOrder?: number;
};
