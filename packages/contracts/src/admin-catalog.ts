import { z } from 'zod';

export const COMPANY_NAME_MAX_LENGTH = 160;

export const companyUpsertInputSchema = z.object({
  companyId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).max(COMPANY_NAME_MAX_LENGTH),
});

export type CompanyUpsertInput = z.infer<typeof companyUpsertInputSchema>;
