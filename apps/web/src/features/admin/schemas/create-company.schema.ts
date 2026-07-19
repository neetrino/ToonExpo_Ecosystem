import { z } from "zod";

import {
  COMPANY_DESCRIPTION_MAX_LENGTH,
  COMPANY_NAME_MAX_LENGTH,
  COMPANY_TYPES,
} from "@/features/admin/constants";
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  PHONE_PATTERN,
} from "@/shared/config/auth.constants";

/**
 * Client schema for platform-admin company provisioning.
 */
export const createCompanySchema = z.object({
  name: z.string().trim().min(1).max(COMPANY_NAME_MAX_LENGTH),
  type: z.enum(COMPANY_TYPES),
  description: z.string().trim().max(COMPANY_DESCRIPTION_MAX_LENGTH),
  adminName: z.string().trim().min(1).max(NAME_MAX_LENGTH),
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
});

export type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;
