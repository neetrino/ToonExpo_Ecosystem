import { PROFILE_NAME_MAX_LENGTH, PROFILE_PHONE_MAX_LENGTH } from '@toonexpo/contracts';
import { z } from 'zod';

import { isValidOptionalPhone } from '@/shared/lib/phone';

/**
 * Client profile-edit form values (phone may be empty to clear).
 */
export const updateProfileFormSchema = z.object({
  name: z.string().trim().min(1).max(PROFILE_NAME_MAX_LENGTH),
  phone: z
    .string()
    .trim()
    .max(PROFILE_PHONE_MAX_LENGTH)
    .refine(isValidOptionalPhone, { message: 'invalid_phone' }),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;
