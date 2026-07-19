import { z } from "zod";

import { PARTNER_PUBLICATION_STATUSES } from "@/features/partners/constants";

export const SERVICE_PROVIDER_NAME_MAX_LENGTH = 200;
export const SERVICE_PROVIDER_DESCRIPTION_MAX_LENGTH = 8000;
export const SERVICE_PROVIDER_SERVICES_MAX_LENGTH = 4000;
export const SERVICE_PROVIDER_PHONE_MAX_LENGTH = 64;
export const SERVICE_PROVIDER_EMAIL_MAX_LENGTH = 320;
export const SERVICE_PROVIDER_WEBSITE_MAX_LENGTH = 2048;
export const SERVICE_PROVIDER_INTERNAL_NOTES_MAX_LENGTH = 8000;
export const SERVICE_PROVIDER_CATEGORY_NAME_MAX_LENGTH = 200;
export const SERVICE_PROVIDER_CATEGORY_DESCRIPTION_MAX_LENGTH = 4000;
export const SERVICE_PROVIDER_SORT_ORDER_MAX = 9999;

export const SERVICE_PROVIDER_TYPES = [
  "company",
  "person",
  "team",
  "other",
] as const;

export const serviceProviderCategorySchema = z.object({
  name: z.string().min(1).max(SERVICE_PROVIDER_CATEGORY_NAME_MAX_LENGTH),
  description: z
    .string()
    .max(SERVICE_PROVIDER_CATEGORY_DESCRIPTION_MAX_LENGTH)
    .optional(),
  sortOrder: z.number().int().min(0).max(SERVICE_PROVIDER_SORT_ORDER_MAX),
  active: z.boolean(),
});

export type ServiceProviderCategoryFormValues = z.infer<
  typeof serviceProviderCategorySchema
>;

export const serviceProviderSchema = z.object({
  name: z.string().min(1).max(SERVICE_PROVIDER_NAME_MAX_LENGTH),
  providerType: z.enum(SERVICE_PROVIDER_TYPES),
  description: z.string().max(SERVICE_PROVIDER_DESCRIPTION_MAX_LENGTH).optional(),
  services: z.string().max(SERVICE_PROVIDER_SERVICES_MAX_LENGTH).optional(),
  phone: z.string().max(SERVICE_PROVIDER_PHONE_MAX_LENGTH).optional(),
  email: z.string().max(SERVICE_PROVIDER_EMAIL_MAX_LENGTH).optional(),
  website: z.string().max(SERVICE_PROVIDER_WEBSITE_MAX_LENGTH).optional(),
  socialFacebook: z.string().optional(),
  socialInstagram: z.string().optional(),
  socialLinkedin: z.string().optional(),
  internalNotes: z
    .string()
    .max(SERVICE_PROVIDER_INTERNAL_NOTES_MAX_LENGTH)
    .optional(),
  active: z.boolean(),
  publicationStatus: z
    .union([z.enum(PARTNER_PUBLICATION_STATUSES), z.literal("")])
    .optional(),
  categoryIds: z.array(z.string().min(1)),
});

export type ServiceProviderFormValues = z.infer<typeof serviceProviderSchema>;
