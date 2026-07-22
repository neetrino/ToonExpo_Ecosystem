import { z } from 'zod';

/** Minimum password length (matches NestJS RegisterDto / DECISIONS). */
export const PASSWORD_MIN_LENGTH = 8;

/** Maximum password length (matches NestJS auth DTOs). */
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Shared password field rule for registration, set-password, and change-password.
 */
export const passwordFieldSchema = z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH);

/**
 * Authenticated change-password payload.
 */
export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: passwordFieldSchema,
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    path: ['newPassword'],
    message: 'New password must differ from current password',
  });

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;

/**
 * Success acknowledgement for change-password.
 */
export type ChangePasswordResponse = {
  message: string;
};

/** Machine-readable change-password validation errors (HTTP 400). */
export const CHANGE_PASSWORD_ERROR_CODES = {
  INVALID_CURRENT_PASSWORD: 'INVALID_CURRENT_PASSWORD',
  SAME_AS_CURRENT: 'SAME_AS_CURRENT',
  NO_PASSWORD_SET: 'NO_PASSWORD_SET',
} as const;

export type ChangePasswordErrorCode =
  (typeof CHANGE_PASSWORD_ERROR_CODES)[keyof typeof CHANGE_PASSWORD_ERROR_CODES];

/**
 * Exclusive platform account type (one user = one type).
 */
export type AccountType = 'buyer' | 'platform_admin' | 'entrance_staff' | 'company_member';

/**
 * Role inside a company (v1). Applies when accountType = company_member.
 */
export type CompanyMemberRole = 'company_admin' | 'member';

/**
 * Business organization type (not a user account type).
 */
export type CompanyType = 'builder' | 'partner' | 'bank' | 'service';

/**
 * Account lifecycle status shared by API and web clients.
 * `invited` = provisioned user without a password yet.
 */
export type UserStatus = 'invited' | 'active' | 'inactive' | 'blocked';

/**
 * Membership lifecycle inside a company (v1).
 */
export type CompanyMemberStatus = 'active' | 'inactive' | 'removed';

/**
 * Buyer self-registration payload.
 */
export type RegisterRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

/**
 * Email+password login payload.
 */
export type LoginRequest = {
  email: string;
  password: string;
};

/**
 * Forgot-password request (email only; response is always opaque).
 */
export type ForgotPasswordRequest = {
  email: string;
};

/**
 * Opaque acknowledgement for forgot-password (never reveals email existence).
 */
export type ForgotPasswordResponse = {
  message: string;
};

/**
 * Public user projection without credential fields.
 */
export type UserResponse = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  accountType: AccountType;
  /** Present for active `company_member` users; null when unassigned. */
  companyType?: CompanyType | null;
  status: UserStatus;
  defaultLocale: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Max length for display name on profile update (matches Nest DTO). */
export const PROFILE_NAME_MAX_LENGTH = 120;

/** Max length for phone on profile update (matches Nest DTO). */
export const PROFILE_PHONE_MAX_LENGTH = 32;

/**
 * Authenticated self-service profile update (`PATCH /auth/me`).
 * Email and account type are not editable here.
 */
export const updateProfileRequestSchema = z.object({
  name: z.string().trim().min(1).max(PROFILE_NAME_MAX_LENGTH),
  phone: z
    .string()
    .trim()
    .max(PROFILE_PHONE_MAX_LENGTH)
    .regex(/^[+0-9()\-\s]*$/, {
      message: 'phone must contain digits and optional phone punctuation',
    })
    .optional(),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

/**
 * Cookie name for the non-httpOnly double-submit CSRF token (readable by JS when same-origin).
 */
export const CSRF_COOKIE_NAME = 'toonexpo_csrf' as const;

/**
 * Request header carrying the double-submit CSRF token on mutating API calls.
 */
export const CSRF_HEADER_NAME = 'X-CSRF-Token' as const;

/**
 * Auth mutation response that establishes or confirms a session cookie.
 * `csrfToken` mirrors the CSRF cookie for cross-origin clients that cannot read API-host cookies.
 */
export type AuthSessionResponse = {
  user: UserResponse;
  csrfToken: string;
};

/**
 * CSRF token for the current session (e.g. after page reload).
 */
export type CsrfTokenResponse = {
  csrfToken: string;
};
