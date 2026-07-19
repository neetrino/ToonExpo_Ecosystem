import { z } from "zod";

import {
  PORTAL_ADDRESS_MAX_LENGTH,
  PORTAL_CITY_MAX_LENGTH,
  PORTAL_DESCRIPTION_MAX_LENGTH,
  PORTAL_LOCATION_MAX_LENGTH,
  PORTAL_PROJECT_NAME_MAX_LENGTH,
  PORTAL_SLUG_MAX_LENGTH,
} from "@/features/builder/constants";
import { optionalMediaIdField } from "@/features/media/schemas/media-fields.schema";

const localeTextSchema = z.object({
  hy: z.string().trim().max(PORTAL_PROJECT_NAME_MAX_LENGTH),
  ru: z.string().trim().max(PORTAL_PROJECT_NAME_MAX_LENGTH),
  en: z.string().trim().max(PORTAL_PROJECT_NAME_MAX_LENGTH),
});

const localeDescriptionSchema = z.object({
  hy: z.string().trim().max(PORTAL_DESCRIPTION_MAX_LENGTH),
  ru: z.string().trim().max(PORTAL_DESCRIPTION_MAX_LENGTH),
  en: z.string().trim().max(PORTAL_DESCRIPTION_MAX_LENGTH),
});

const localeLocationSchema = z.object({
  hy: z.string().trim().max(PORTAL_LOCATION_MAX_LENGTH),
  ru: z.string().trim().max(PORTAL_LOCATION_MAX_LENGTH),
  en: z.string().trim().max(PORTAL_LOCATION_MAX_LENGTH),
});

/**
 * Client schema for creating a portal project with hy-required translations.
 */
export const createProjectSchema = z.object({
  nameHy: z.string().trim().min(1).max(PORTAL_PROJECT_NAME_MAX_LENGTH),
  nameRu: z.string().trim().max(PORTAL_PROJECT_NAME_MAX_LENGTH),
  nameEn: z.string().trim().max(PORTAL_PROJECT_NAME_MAX_LENGTH),
  slug: z.string().trim().max(PORTAL_SLUG_MAX_LENGTH),
  shortDescriptionHy: z.string().trim().max(PORTAL_DESCRIPTION_MAX_LENGTH),
  shortDescriptionRu: z.string().trim().max(PORTAL_DESCRIPTION_MAX_LENGTH),
  shortDescriptionEn: z.string().trim().max(PORTAL_DESCRIPTION_MAX_LENGTH),
  fullDescriptionHy: z.string().trim().max(PORTAL_DESCRIPTION_MAX_LENGTH),
  fullDescriptionRu: z.string().trim().max(PORTAL_DESCRIPTION_MAX_LENGTH),
  fullDescriptionEn: z.string().trim().max(PORTAL_DESCRIPTION_MAX_LENGTH),
  locationTextHy: z.string().trim().max(PORTAL_LOCATION_MAX_LENGTH),
  locationTextRu: z.string().trim().max(PORTAL_LOCATION_MAX_LENGTH),
  locationTextEn: z.string().trim().max(PORTAL_LOCATION_MAX_LENGTH),
  address: z.string().trim().max(PORTAL_ADDRESS_MAX_LENGTH),
  city: z.string().trim().max(PORTAL_CITY_MAX_LENGTH),
  district: z.string().trim().max(PORTAL_CITY_MAX_LENGTH),
  projectType: z.string().trim().max(120),
  constructionStatus: z.string().trim().max(120),
  completionDate: z.string().trim().max(32),
  coverMediaId: optionalMediaIdField,
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

/**
 * Client schema for updating a portal project.
 */
export const updateProjectSchema = createProjectSchema;

export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;

export { localeTextSchema, localeDescriptionSchema, localeLocationSchema };
