import { z } from "zod";

import {
  COMPANY_DESCRIPTION_MAX_LENGTH,
  COMPANY_NAME_MAX_LENGTH,
  COMPANY_STATUSES,
} from "@/features/admin/constants";

/**
 * Client schema for platform-admin company PATCH.
 */
export const updateCompanySchema = z.object({
  name: z.string().trim().min(1).max(COMPANY_NAME_MAX_LENGTH),
  description: z.string().trim().max(COMPANY_DESCRIPTION_MAX_LENGTH),
  status: z.enum(COMPANY_STATUSES),
});

export type UpdateCompanyFormValues = z.infer<typeof updateCompanySchema>;
