import type {
  PartnerCompanyStatus,
  PartnerCompanyType,
  PublicationStatus,
} from "@toonexpo/contracts";
import { z } from "zod";

import { COMPANY_NAME_MAX_LENGTH } from "@/features/admin/constants";
import {
  PARTNER_COMPANY_STATUSES,
  PARTNER_COMPANY_TYPES,
  PARTNER_PUBLICATION_STATUSES,
} from "@/features/partners/constants";
import { optionalMediaIdField } from "@/features/media/schemas/media-fields.schema";
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  PHONE_PATTERN,
} from "@/shared/config/auth.constants";

const partnerTypeSchema = z.enum(
  PARTNER_COMPANY_TYPES as unknown as [PartnerCompanyType, ...PartnerCompanyType[]],
);

const partnerStatusSchema = z.enum(
  PARTNER_COMPANY_STATUSES as unknown as [
    PartnerCompanyStatus,
    ...PartnerCompanyStatus[],
  ],
);

const publicationStatusSchema = z.enum(
  PARTNER_PUBLICATION_STATUSES as unknown as [
    PublicationStatus,
    ...PublicationStatus[],
  ],
);

export const createPartnerSchema = z
  .object({
    name: z.string().trim().min(1).max(COMPANY_NAME_MAX_LENGTH),
    type: partnerTypeSchema,
    adminFirstName: z.string().trim().min(1).max(NAME_MAX_LENGTH),
    adminSurname: z.string().trim().min(1).max(NAME_MAX_LENGTH),
    adminEmail: z
      .email()
      .max(EMAIL_MAX_LENGTH)
      .transform((value) => value.trim().toLowerCase()),
    adminPhone: z
      .string()
      .trim()
      .refine(
        (value) =>
          value.length === 0 ||
          (value.length >= PHONE_MIN_LENGTH &&
            value.length <= PHONE_MAX_LENGTH &&
            PHONE_PATTERN.test(value)),
        { message: "phone" },
      ),
  })
  .refine(
    (values) => `${values.adminFirstName} ${values.adminSurname}`.length <= NAME_MAX_LENGTH,
    { path: ["adminSurname"], message: "adminNameTooLong" },
  );

export type CreatePartnerFormValues = z.infer<typeof createPartnerSchema>;

const profileLocaleFields = {
  shortDescriptionHy: z.string().max(8000),
  shortDescriptionRu: z.string().max(8000),
  shortDescriptionEn: z.string().max(8000),
  fullDescriptionHy: z.string().max(8000),
  fullDescriptionRu: z.string().max(8000),
  fullDescriptionEn: z.string().max(8000),
};

const contactFields = {
  contactPhone: z.string().max(64),
  contactEmail: z.string().max(320),
  website: z.string().max(500),
  socialFacebook: z.string().max(500),
  socialInstagram: z.string().max(500),
  socialLinkedin: z.string().max(500),
};

const mediaFields = {
  logoMediaId: optionalMediaIdField,
  coverMediaId: optionalMediaIdField,
};

export const updatePartnerSchema = z.object({
  type: partnerTypeSchema,
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(120),
  status: partnerStatusSchema,
  publicationStatus: publicationStatusSchema,
  featured: z.boolean(),
  ...profileLocaleFields,
  ...contactFields,
  ...mediaFields,
});

export type UpdatePartnerFormValues = z.infer<typeof updatePartnerSchema>;

export const partnerProfileSchema = z.object({
  ...profileLocaleFields,
  ...contactFields,
  ...mediaFields,
});

export type PartnerProfileFormValues = z.infer<typeof partnerProfileSchema>;

export const partnerOfferSchema = z.object({
  titleHy: z.string().trim().min(1).max(200),
  titleRu: z.string().max(200),
  titleEn: z.string().max(200),
  descriptionHy: z.string().max(8000),
  descriptionRu: z.string().max(8000),
  descriptionEn: z.string().max(8000),
  publicationStatus: publicationStatusSchema,
  sortOrder: z.number().int().min(0).max(9999),
});

export type PartnerOfferFormValues = z.infer<typeof partnerOfferSchema>;
