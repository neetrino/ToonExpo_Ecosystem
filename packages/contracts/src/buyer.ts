import { z } from 'zod';

export const BUYER_PROFILE_NAME_MAX_LENGTH = 120;
export const BUYER_PROFILE_PHONE_MIN_LENGTH = 5;
export const BUYER_PROFILE_PHONE_MAX_LENGTH = 30;

const optionalBuyerPhoneSchema = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().min(BUYER_PROFILE_PHONE_MIN_LENGTH).max(BUYER_PROFILE_PHONE_MAX_LENGTH).optional());

/** Buyer self-service profile update (name/phone only). Email is read-only in v1. */
export const buyerProfileUpdateInputSchema = z.object({
  name: z.string().trim().min(1).max(BUYER_PROFILE_NAME_MAX_LENGTH),
  phone: optionalBuyerPhoneSchema,
});

export type BuyerProfileUpdateInput = z.infer<typeof buyerProfileUpdateInputSchema>;

export const buyerProfileSchema = z.object({
  name: z.string().nullable(),
  email: z.string().email(),
  phone: z.string().nullable(),
});

export type BuyerProfile = z.infer<typeof buyerProfileSchema>;

export const buyerProfileUpdateResponseSchema = z.object({
  ok: z.literal(true),
});

export type BuyerProfileUpdateResponse = z.infer<typeof buyerProfileUpdateResponseSchema>;
