import { z } from "zod";

/**
 * Client forgot-password schema: email only.
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
