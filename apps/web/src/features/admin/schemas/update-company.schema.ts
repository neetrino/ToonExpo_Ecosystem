import { z } from 'zod';

import {
  COMPANY_DESCRIPTION_MAX_LENGTH,
  COMPANY_NAME_MAX_LENGTH,
  COMPANY_SHORT_DESCRIPTION_MAX_LENGTH,
  COMPANY_STATUSES,
} from '@/features/admin/constants';
import { companyContactFieldsSchema } from '@/features/companies/schemas/company-contact-fields.schema';
import { optionalMediaIdField } from '@/features/media/schemas/media-fields.schema';

/**
 * Client schema for platform-admin company PATCH.
 */
export const updateCompanySchema = z
  .object({
    name: z.string().trim().min(1).max(COMPANY_NAME_MAX_LENGTH),
    description: z.string().trim().max(COMPANY_DESCRIPTION_MAX_LENGTH),
    shortDescription: z.string().trim().max(COMPANY_SHORT_DESCRIPTION_MAX_LENGTH),
    status: z.enum(COMPANY_STATUSES),
    logoMediaId: optionalMediaIdField,
    coverMediaId: optionalMediaIdField,
  })
  .merge(companyContactFieldsSchema);

export type UpdateCompanyFormValues = z.infer<typeof updateCompanySchema>;
