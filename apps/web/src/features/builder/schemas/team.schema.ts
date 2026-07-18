import { z } from "zod";

import {
  COMPANY_MEMBER_ROLES,
  COMPANY_MEMBER_STATUSES,
} from "@/features/builder/constants";
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  PHONE_PATTERN,
} from "@/shared/config/auth.constants";

/**
 * Client schema for inviting a company member.
 */
export const inviteMemberSchema = z.object({
  name: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  email: z
    .email()
    .max(EMAIL_MAX_LENGTH)
    .transform((value) => value.trim().toLowerCase()),
  phone: z
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
  role: z.enum(COMPANY_MEMBER_ROLES),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

/**
 * Client schema for updating a company member.
 */
export const updateMemberSchema = z.object({
  role: z.enum(COMPANY_MEMBER_ROLES),
  status: z.enum(COMPANY_MEMBER_STATUSES),
});

export type UpdateMemberFormValues = z.infer<typeof updateMemberSchema>;
