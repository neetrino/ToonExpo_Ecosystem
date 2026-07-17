import { PLATFORM_ROLES } from '@toonexpo/domain';
import { z } from 'zod';

export const platformRoleSchema = z.enum(PLATFORM_ROLES);

export const buyerRegisterSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(32),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

export type BuyerRegisterInput = z.infer<typeof buyerRegisterSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Consumes a one-time account-invite token and sets the invitee's password. */
export const setPasswordSchema = z
  .object({
    token: z.string().trim().min(1),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
  });

export type SetPasswordInput = z.infer<typeof setPasswordSchema>;

/** Public session user returned by GET /auth/me and login/register. */
export const authUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  role: platformRoleSchema,
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const authSessionSchema = z.object({
  user: authUserSchema,
  expires: z.string().min(1),
});

export type AuthSession = z.infer<typeof authSessionSchema>;

export const authErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'INVALID_CREDENTIALS',
  'EMAIL_TAKEN',
  'INVALID_INVITE',
  'RATE_LIMITED',
  'UNAUTHORIZED',
  'CSRF_REJECTED',
  'FORBIDDEN_ORIGIN',
]);

export type AuthErrorCode = z.infer<typeof authErrorCodeSchema>;

export const authErrorResponseSchema = z.object({
  code: authErrorCodeSchema,
  message: z.string(),
});

export type AuthErrorResponse = z.infer<typeof authErrorResponseSchema>;
