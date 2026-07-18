import { z } from "zod";

import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/shared/config/auth.constants";

/**
 * Client login schema mirroring NestJS LoginDto.
 */
export const loginSchema = z.object({
  email: z
    .email()
    .max(EMAIL_MAX_LENGTH)
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
