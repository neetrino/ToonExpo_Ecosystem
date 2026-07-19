import { z } from "zod";

import {
  BANK_OFFER_CALCULATION_NOTES_MAX_LENGTH,
  BANK_OFFER_DOWN_PAYMENT_MAX,
  BANK_OFFER_DOWN_PAYMENT_MIN,
  BANK_OFFER_FEES_MAX_LENGTH,
  BANK_OFFER_MAX_TERM_OPTIONS,
  BANK_OFFER_RATE_MAX,
  BANK_OFFER_RATE_MIN,
  BANK_OFFER_SHORT_DESCRIPTION_MAX_LENGTH,
  BANK_OFFER_SORT_ORDER_MAX,
  BANK_OFFER_TERM_MAX_YEARS,
  BANK_OFFER_TERM_MIN_YEARS,
  BANK_OFFER_TITLE_MAX_LENGTH,
} from "@/features/mortgage/constants";
import { PARTNER_PUBLICATION_STATUSES } from "@/features/partners/constants";

const termOptionsField = z
  .string()
  .min(1)
  .transform((value) =>
    value
      .split(",")
      .map((part) => Number(part.trim()))
      .filter((num) => Number.isFinite(num)),
  )
  .refine(
    (terms) =>
      terms.length >= 1 &&
      terms.length <= BANK_OFFER_MAX_TERM_OPTIONS &&
      terms.every(
        (term) =>
          Number.isInteger(term) &&
          term >= BANK_OFFER_TERM_MIN_YEARS &&
          term <= BANK_OFFER_TERM_MAX_YEARS,
      ),
    { message: "invalidTerms" },
  );

export const bankOfferFormSchema = z.object({
  partnerCompanyId: z.string().min(1),
  title: z.string().min(1).max(BANK_OFFER_TITLE_MAX_LENGTH),
  shortDescription: z
    .string()
    .max(BANK_OFFER_SHORT_DESCRIPTION_MAX_LENGTH)
    .optional(),
  rate: z.number().min(BANK_OFFER_RATE_MIN).max(BANK_OFFER_RATE_MAX),
  apr: z.number().min(BANK_OFFER_RATE_MIN).max(BANK_OFFER_RATE_MAX).optional(),
  minDownPaymentPercent: z
    .number()
    .min(BANK_OFFER_DOWN_PAYMENT_MIN)
    .max(BANK_OFFER_DOWN_PAYMENT_MAX),
  termOptionsYears: termOptionsField,
  fees: z.string().max(BANK_OFFER_FEES_MAX_LENGTH).optional(),
  calculationNotes: z
    .string()
    .max(BANK_OFFER_CALCULATION_NOTES_MAX_LENGTH)
    .optional(),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(BANK_OFFER_SORT_ORDER_MAX),
  publicationStatus: z.enum(PARTNER_PUBLICATION_STATUSES),
});

export type BankOfferFormInput = z.input<typeof bankOfferFormSchema>;
export type BankOfferFormValues = z.output<typeof bankOfferFormSchema>;

export const portalBankOfferFormSchema = bankOfferFormSchema.omit({
  partnerCompanyId: true,
  publicationStatus: true,
});

export type PortalBankOfferFormInput = z.input<typeof portalBankOfferFormSchema>;
export type PortalBankOfferFormValues = z.output<typeof portalBankOfferFormSchema>;

export const termOptionsToField = (terms: number[]): string => terms.join(", ");
