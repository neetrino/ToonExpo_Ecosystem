import {
  BANK_PARTNER_OFFER_FINANCE_KEYS,
  BANK_PARTNER_OFFER_STATIC_KEYS,
  type BankPartnerOfferFinanceFields,
} from '@toonexpo/contracts';
import { z } from 'zod';

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
  name: z.string().min(1).max(NAME_MAX),
  fields: fieldsSchema,
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

const STATIC_FINANCE_KEYS = new Set<string>(BANK_PARTNER_OFFER_STATIC_KEYS);

const shareLocaleText = (value: {
  hy: string;
  ru: string;
  en: string;
}): { hy: string; ru: string; en: string } => {
  const shared = value.hy.trim() || value.ru.trim() || value.en.trim();
  return { hy: shared, ru: shared, en: shared };
};

/**
 * Loads finance fields into the admin form.
 * Static keys (price) are copied into every locale so one input covers hy/ru/en.
 */
export const hydrateBankPartnerFinanceFields = (
  fields: BankPartnerOfferFinanceFields,
): BankPartnerOfferTemplateFormValues['fields'] => {
  const next = emptyFinanceFields();
  for (const key of BANK_PARTNER_OFFER_FINANCE_KEYS) {
    const merged = { ...emptyLocaleText(), ...fields[key] };
    next[key] = STATIC_FINANCE_KEYS.has(key) ? shareLocaleText(merged) : merged;
  }
  return next;
};

export const projectBankPartnerOfferFormSchema = z.object({
  name: z.string().min(1).max(NAME_MAX),
  fields: fieldsSchema,
  sortOrder: z.number().int().min(0).max(10_000),
});

export type ProjectBankPartnerOfferFormValues = z.infer<
  typeof projectBankPartnerOfferFormSchema
>;
