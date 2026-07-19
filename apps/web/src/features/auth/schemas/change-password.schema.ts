import { changePasswordRequestSchema, passwordFieldSchema } from '@toonexpo/contracts';
import type { z } from 'zod';

/**
 * Client change-password schema: current + new + confirmation.
 */
export const changePasswordFormSchema = changePasswordRequestSchema
  .extend({
    confirmPassword: passwordFieldSchema,
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'mismatch',
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
