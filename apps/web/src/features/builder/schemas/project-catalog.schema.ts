import { z } from 'zod';

import { PROJECT_CATALOG_DETAIL_KEYS } from '@/features/catalog/utils/project-catalog-details';
import { PROJECT_CATALOG_LINK_IDS } from '@/features/catalog/utils/project-catalog-links';

import {
  PROJECT_CATALOG_FIELD_MAX_LENGTH,
} from '@/features/builder/constants/project-catalog-editor';

const catalogLocaleTextSchema = z.object({
  hy: z.string().trim().max(PROJECT_CATALOG_FIELD_MAX_LENGTH),
  ru: z.string().trim().max(PROJECT_CATALOG_FIELD_MAX_LENGTH),
  en: z.string().trim().max(PROJECT_CATALOG_FIELD_MAX_LENGTH),
});

const catalogDetailsShape = Object.fromEntries(
  PROJECT_CATALOG_DETAIL_KEYS.map((key) => [key, catalogLocaleTextSchema]),
) as Record<(typeof PROJECT_CATALOG_DETAIL_KEYS)[number], typeof catalogLocaleTextSchema>;

const catalogLinksShape = Object.fromEntries(
  PROJECT_CATALOG_LINK_IDS.map((id) => [id, z.string().trim().max(2_048)]),
) as Record<(typeof PROJECT_CATALOG_LINK_IDS)[number], z.ZodString>;

/**
 * Catalog extras edited on the project detail Admin/portal form.
 */
export const projectCatalogFormSchema = z.object({
  catalogDetails: z.object(catalogDetailsShape),
  amenityLabelsHy: z.string().trim().max(PROJECT_CATALOG_FIELD_MAX_LENGTH * 2),
  amenityLabelsRu: z.string().trim().max(PROJECT_CATALOG_FIELD_MAX_LENGTH * 2),
  amenityLabelsEn: z.string().trim().max(PROJECT_CATALOG_FIELD_MAX_LENGTH * 2),
  nearbyPlacesHy: z.string().trim().max(PROJECT_CATALOG_FIELD_MAX_LENGTH * 2),
  nearbyPlacesRu: z.string().trim().max(PROJECT_CATALOG_FIELD_MAX_LENGTH * 2),
  nearbyPlacesEn: z.string().trim().max(PROJECT_CATALOG_FIELD_MAX_LENGTH * 2),
  catalogLinks: z.object(catalogLinksShape),
});

export type ProjectCatalogFormValues = z.infer<typeof projectCatalogFormSchema>;
