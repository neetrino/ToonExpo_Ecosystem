import { PROFILE_NAME_MAX_LENGTH, PROFILE_PHONE_MAX_LENGTH } from '@toonexpo/contracts';
import { z } from 'zod';

/**
 * Client profile-edit form values (phone may be empty to clear).
 */
export const updateProfileFormSchema = z.object({
  name: z.string().trim().min(1).max(PROFILE_NAME_MAX_LENGTH),
  phone: z
    .string()
    .trim()
    .max(PROFILE_PHONE_MAX_LENGTH)
    .regex(/^[+0-9()\-\s]*$/, { message: 'invalid_phone' }),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;
