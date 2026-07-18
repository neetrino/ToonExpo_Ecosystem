import type {
  PartnerCompanyStatus,
  PartnerCompanyType,
  PublicationStatus,
} from "@toonexpo/contracts";
import { z } from "zod";

import {
  PARTNER_COMPANY_STATUSES,
  PARTNER_COMPANY_TYPES,
  PARTNER_PUBLICATION_STATUSES,
} from "@/features/partners/constants";

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

export const createPartnerSchema = z.object({
  companyId: z.string().min(1),
  type: partnerTypeSchema,
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(120),
});

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

export const updatePartnerSchema = z.object({
  type: partnerTypeSchema,
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(120),
  status: partnerStatusSchema,
  publicationStatus: publicationStatusSchema,
  featured: z.boolean(),
  ...profileLocaleFields,
  ...contactFields,
});

export type UpdatePartnerFormValues = z.infer<typeof updatePartnerSchema>;

export const partnerProfileSchema = z.object({
  ...profileLocaleFields,
  ...contactFields,
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
