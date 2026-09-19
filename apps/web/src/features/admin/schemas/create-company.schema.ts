import { z } from "zod";

import { COMPANY_TYPES } from "@/features/admin/constants";
import { companyCopyFieldsSchema } from "@/features/admin/schemas/company-copy-fields.schema";
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
} from "@/shared/config/auth.constants";
import { isValidOptionalPhone } from "@/shared/lib/phone";

/**
 * Client schema for platform-admin company provisioning.
 */
export const createCompanySchema = companyCopyFieldsSchema.extend({
  type: z.enum(COMPANY_TYPES),
  adminName: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  adminEmail: z
    .email()
    .max(EMAIL_MAX_LENGTH)
    .transform((value) => value.trim().toLowerCase()),
  adminPhone: z
    .string()
    .trim()
    .refine(isValidOptionalPhone, { message: "phone" }),
});

export type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;
