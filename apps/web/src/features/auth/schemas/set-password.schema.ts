import { z } from "zod";

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/shared/config/auth.constants";

/**
 * Client set-password schema: password + confirmation (≥8).
 */
export const setPasswordSchema = z
  .object({
    password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
    confirmPassword: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "mismatch",
  });

export type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;
