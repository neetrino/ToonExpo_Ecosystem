import { z } from 'zod';

import { COMPANY_STATUSES } from '@/features/admin/constants';
import { companyCopyFieldsSchema } from '@/features/admin/schemas/company-copy-fields.schema';
import { companyContactFieldsSchema } from '@/features/companies/schemas/company-contact-fields.schema';
import { optionalMediaIdField } from '@/features/media/schemas/media-fields.schema';

/**
 * Client schema for platform-admin company PATCH.
 */
export const updateCompanySchema = companyCopyFieldsSchema
  .extend({
    status: z.enum(COMPANY_STATUSES),
    logoMediaId: optionalMediaIdField,
    coverMediaId: optionalMediaIdField,
  })
  .merge(companyContactFieldsSchema);

export type UpdateCompanyFormValues = z.infer<typeof updateCompanySchema>;
