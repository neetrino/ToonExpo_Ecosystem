import { z } from "zod";

import {
  BANK_OFFER_DOWN_PAYMENT_MAX,
  BANK_OFFER_DOWN_PAYMENT_MIN,
  BANK_OFFER_TERM_MAX_YEARS,
  BANK_OFFER_TERM_MIN_YEARS,
  MORTGAGE_PROPERTY_PRICE_MAX,
  MORTGAGE_PROPERTY_PRICE_MIN,
} from "@/features/mortgage/constants";

export const mortgageCalculatorSchema = z
  .object({
    propertyPrice: z
      .number()
      .int()
      .min(MORTGAGE_PROPERTY_PRICE_MIN)
      .max(MORTGAGE_PROPERTY_PRICE_MAX),
    downPaymentPercent: z
      .number()
      .min(BANK_OFFER_DOWN_PAYMENT_MIN)
      .max(BANK_OFFER_DOWN_PAYMENT_MAX),
    loanTermYears: z
      .number()
      .int()
      .min(BANK_OFFER_TERM_MIN_YEARS)
      .max(BANK_OFFER_TERM_MAX_YEARS),
    bankOfferId: z.string().min(1),
    minDownPaymentPercent: z.number(),
    termOptionsYears: z.array(z.number().int()).min(1),
  })
  .superRefine((values, ctx) => {
    if (values.downPaymentPercent < values.minDownPaymentPercent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["downPaymentPercent"],
        message: "downPaymentBelowMinimum",
      });
    }

    if (!values.termOptionsYears.includes(values.loanTermYears)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["loanTermYears"],
        message: "invalidTerm",
      });
    }
  });

export type MortgageCalculatorFormValues = z.infer<typeof mortgageCalculatorSchema>;
