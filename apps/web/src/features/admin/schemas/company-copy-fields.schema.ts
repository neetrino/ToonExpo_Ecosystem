import { z } from 'zod';

import {
  COMPANY_DESCRIPTION_MAX_LENGTH,
  COMPANY_NAME_MAX_LENGTH,
  COMPANY_SHORT_DESCRIPTION_MAX_LENGTH,
} from '@/features/admin/constants';

/**
 * HY-required company copy fields shared by create and edit forms.
 */
export const companyCopyFieldsSchema = z.object({
  nameHy: z.string().trim().min(1).max(COMPANY_NAME_MAX_LENGTH),
  nameRu: z.string().trim().max(COMPANY_NAME_MAX_LENGTH),
  nameEn: z.string().trim().max(COMPANY_NAME_MAX_LENGTH),
  shortDescriptionHy: z.string().trim().max(COMPANY_SHORT_DESCRIPTION_MAX_LENGTH),
  shortDescriptionRu: z.string().trim().max(COMPANY_SHORT_DESCRIPTION_MAX_LENGTH),
  shortDescriptionEn: z.string().trim().max(COMPANY_SHORT_DESCRIPTION_MAX_LENGTH),
  descriptionHy: z.string().trim().max(COMPANY_DESCRIPTION_MAX_LENGTH),
  descriptionRu: z.string().trim().max(COMPANY_DESCRIPTION_MAX_LENGTH),
  descriptionEn: z.string().trim().max(COMPANY_DESCRIPTION_MAX_LENGTH),
});

export type CompanyCopyFieldsValues = z.infer<typeof companyCopyFieldsSchema>;

export const emptyCompanyCopyValues = (): CompanyCopyFieldsValues => ({
  nameHy: '',
  nameRu: '',
  nameEn: '',
  shortDescriptionHy: '',
  shortDescriptionRu: '',
  shortDescriptionEn: '',
  descriptionHy: '',
  descriptionRu: '',
  descriptionEn: '',
});
