import { z } from 'zod';

import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_E164_LIKE_PATTERN,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
} from '@/shared/config/auth.constants';

const namePartSchema = z.string().trim().min(1).max(NAME_MAX_LENGTH);

/**
 * Client registration form schema.
 * `firstName` and `surname` are stored as separate account fields.
 */
export const registerSchema = z
  .object({
    firstName: namePartSchema,
    surname: namePartSchema,
    phone: z
      .string()
      .trim()
      .min(PHONE_MIN_LENGTH)
      .max(PHONE_MAX_LENGTH)
      .regex(PHONE_E164_LIKE_PATTERN),
    email: z
      .email()
      .max(EMAIL_MAX_LENGTH)
      .transform((value) => value.trim().toLowerCase()),
    password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
    confirmPassword: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'mismatch',
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Maps register form values to the NestJS RegisterRequest payload.
 */
export const toRegisterRequest = (
  values: RegisterFormValues,
): {
  name: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
} => ({
  name: values.firstName,
  surname: values.surname,
  email: values.email,
  phone: values.phone,
  password: values.password,
});
