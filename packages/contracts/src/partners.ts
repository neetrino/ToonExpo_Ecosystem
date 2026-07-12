import { PARTNER_TYPES, PUBLICATION_STATUSES } from '@toonexpo/domain';
import { z } from 'zod';

import { optionalHttpUrlSchema } from './url';

export const PARTNER_NAME_MAX_LENGTH = 160;
export const PARTNER_DESCRIPTION_MAX_LENGTH = 4000;
export const PARTNER_LOGO_URL_MAX_LENGTH = 2048;
export const PARTNER_PHONE_MAX_LENGTH = 40;
export const PARTNER_EMAIL_MAX_LENGTH = 254;
export const PARTNER_WEBSITE_MAX_LENGTH = 2048;
export const PARTNER_SERVICE_CATEGORY_MAX_LENGTH = 60;
export const PARTNER_SERVICE_CATEGORIES_MAX = 20;

export const BANK_OFFER_TITLE_MAX_LENGTH = 160;
export const BANK_OFFER_DESCRIPTION_MAX_LENGTH = 4000;
export const BANK_OFFER_INTEREST_RATE_MIN = 0.01;
export const BANK_OFFER_INTEREST_RATE_MAX = 50;
export const BANK_OFFER_MAX_TERM_MONTHS_MIN = 1;
export const BANK_OFFER_MAX_TERM_MONTHS_MAX = 600;
export const BANK_OFFER_MAX_AMOUNT_AMD_MAX = 10_000_000_000;

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().max(maxLength).optional());

const emptyToUndefined = (value: unknown): unknown => {
  if (value === '' || value === null) {
    return undefined;
  }
  return value;
};

const optionalCoercedInt = (min: number, max: number) =>
  z.preprocess(emptyToUndefined, z.coerce.number().int().min(min).max(max).optional());

const requiredCoercedNumber = (min: number, max: number) =>
  z.preprocess(emptyToUndefined, z.coerce.number().min(min).max(max));

const requiredCoercedInt = (min: number, max: number) =>
  z.preprocess(emptyToUndefined, z.coerce.number().int().min(min).max(max));

const optionalEmail = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().email().max(PARTNER_EMAIL_MAX_LENGTH).optional());

const serviceCategoriesSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    }
    return value;
  },
  z
    .array(z.string().trim().min(1).max(PARTNER_SERVICE_CATEGORY_MAX_LENGTH))
    .max(PARTNER_SERVICE_CATEGORIES_MAX)
    .optional(),
);

export const partnerUpsertInputSchema = z.object({
  partnerId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).max(PARTNER_NAME_MAX_LENGTH),
  type: z.enum(PARTNER_TYPES),
  logoUrl: optionalHttpUrlSchema(PARTNER_LOGO_URL_MAX_LENGTH),
  description: optionalTrimmedString(PARTNER_DESCRIPTION_MAX_LENGTH),
  phone: optionalTrimmedString(PARTNER_PHONE_MAX_LENGTH),
  email: optionalEmail,
  website: optionalHttpUrlSchema(PARTNER_WEBSITE_MAX_LENGTH),
  serviceCategories: serviceCategoriesSchema,
});

export type PartnerUpsertInput = z.infer<typeof partnerUpsertInputSchema>;

export const partnerStatusInputSchema = z.object({
  partnerId: z.string().trim().min(1),
  status: z.enum(PUBLICATION_STATUSES),
});

export type PartnerStatusInput = z.infer<typeof partnerStatusInputSchema>;

export const bankOfferUpsertInputSchema = z.object({
  bankOfferId: z.string().trim().min(1).optional(),
  partnerId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(BANK_OFFER_TITLE_MAX_LENGTH),
  description: optionalTrimmedString(BANK_OFFER_DESCRIPTION_MAX_LENGTH),
  interestRate: requiredCoercedNumber(BANK_OFFER_INTEREST_RATE_MIN, BANK_OFFER_INTEREST_RATE_MAX),
  maxTermMonths: requiredCoercedInt(BANK_OFFER_MAX_TERM_MONTHS_MIN, BANK_OFFER_MAX_TERM_MONTHS_MAX),
  maxAmountAmd: optionalCoercedInt(1, BANK_OFFER_MAX_AMOUNT_AMD_MAX),
  featured: z.preprocess((value) => {
    if (value === 'true' || value === true || value === 'on' || value === '1') {
      return true;
    }
    if (value === 'false' || value === false || value === 'off' || value === '0' || value === '') {
      return false;
    }
    return value;
  }, z.boolean().optional()),
});

export type BankOfferUpsertInput = z.infer<typeof bankOfferUpsertInputSchema>;

export const bankOfferStatusInputSchema = z.object({
  bankOfferId: z.string().trim().min(1),
  status: z.enum(PUBLICATION_STATUSES),
});

export type BankOfferStatusInput = z.infer<typeof bankOfferStatusInputSchema>;

export const publicBankOfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  interestRate: z.number(),
  maxTermMonths: z.number().int(),
  maxAmountAmd: z.number().int().nullable(),
  featured: z.boolean(),
});

export type PublicBankOffer = z.infer<typeof publicBankOfferSchema>;

export const publicPartnerSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  type: z.enum(PARTNER_TYPES),
  logoUrl: z.string().nullable(),
  description: z.string().nullable(),
});

export type PublicPartnerSummary = z.infer<typeof publicPartnerSummarySchema>;

export const publicPartnerDetailSchema = publicPartnerSummarySchema.extend({
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  serviceCategories: z.array(z.string()),
  bankOffers: z.array(publicBankOfferSchema),
});

export type PublicPartnerDetail = z.infer<typeof publicPartnerDetailSchema>;
