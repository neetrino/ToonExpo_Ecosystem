import { BANK_PARTNER_OFFER_FINANCE_KEYS } from '@toonexpo/contracts';
import { z } from 'zod';

import { PARTNER_PUBLICATION_STATUSES } from '@/features/partners/constants';

const FIELD_MAX = 2_000;
const NAME_MAX = 200;

const localeTextSchema = z.object({
  hy: z.string().max(FIELD_MAX),
  ru: z.string().max(FIELD_MAX),
  en: z.string().max(FIELD_MAX),
});

const fieldsSchema = z.object(
  Object.fromEntries(
    BANK_PARTNER_OFFER_FINANCE_KEYS.map((key) => [key, localeTextSchema]),
  ) as Record<(typeof BANK_PARTNER_OFFER_FINANCE_KEYS)[number], typeof localeTextSchema>,
);

export const bankPartnerOfferTemplateFormSchema = z.object({
  partnerCompanyId: z.string().min(1),
  name: z.string().min(1).max(NAME_MAX),
  fields: fieldsSchema,
  publicationStatus: z.enum(PARTNER_PUBLICATION_STATUSES),
  sortOrder: z.number().int().min(0).max(10_000),
});

export type BankPartnerOfferTemplateFormValues = z.infer<
  typeof bankPartnerOfferTemplateFormSchema
>;

export const emptyLocaleText = (): { hy: string; ru: string; en: string } => ({
  hy: '',
  ru: '',
  en: '',
});

export const emptyFinanceFields = (): BankPartnerOfferTemplateFormValues['fields'] => {
  const fields = {} as BankPartnerOfferTemplateFormValues['fields'];
  for (const key of BANK_PARTNER_OFFER_FINANCE_KEYS) {
    fields[key] = emptyLocaleText();
  }
  return fields;
};

export const projectBankPartnerOfferFormSchema = z.object({
  name: z.string().min(1).max(NAME_MAX),
  fields: fieldsSchema,
  sortOrder: z.number().int().min(0).max(10_000),
});

export type ProjectBankPartnerOfferFormValues = z.infer<
  typeof projectBankPartnerOfferFormSchema
>;
