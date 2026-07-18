import { z } from "zod";

import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  PHONE_PATTERN,
} from "@/shared/config/auth.constants";

/**
 * Client registration schema mirroring NestJS RegisterDto.
 */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(NAME_MAX_LENGTH),
  email: z
    .email()
    .max(EMAIL_MAX_LENGTH)
    .transform((value) => value.trim().toLowerCase()),
  phone: z
    .string()
    .trim()
    .min(PHONE_MIN_LENGTH)
    .max(PHONE_MAX_LENGTH)
    .regex(PHONE_PATTERN),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
