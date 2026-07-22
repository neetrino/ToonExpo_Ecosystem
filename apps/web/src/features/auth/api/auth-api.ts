import type {
  AuthSessionResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  SetPasswordRequest,
  UserResponse,
} from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';
import { clearCsrfTokenCache, setCsrfTokenCache } from '@/shared/api/csrf';
import { ApiError, isApiErrorStatus } from '@/shared/api/errors';

import {
  clearClientSessionHint,
  hasClientSessionHint,
  hasSessionCookieInHeader,
  markClientSessionHint,
} from '@/features/auth/utils/session-hint';

const jsonCredentials = {
  credentials: 'include' as const,
  headers: { 'Content-Type': 'application/json' },
};

/**
 * Registers a buyer and establishes a session cookie.
 */
export const registerUser = async (body: RegisterRequest): Promise<AuthSessionResponse> => {
  const result = await apiFetch<AuthSessionResponse>({
    path: '/auth/register',
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });
  setCsrfTokenCache(result.csrfToken);
  markClientSessionHint();
  return result;
};

/**
 * Logs in with email/password and establishes a session cookie.
 */
export const loginUser = async (body: LoginRequest): Promise<AuthSessionResponse> => {
  const result = await apiFetch<AuthSessionResponse>({
    path: '/auth/login',
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });
  setCsrfTokenCache(result.csrfToken);
  markClientSessionHint();
  return result;
};

/**
 * Requests a password-reset email (always opaque 200).
 */
export const forgotPassword = (body: ForgotPasswordRequest): Promise<ForgotPasswordResponse> =>
  apiFetch({
    path: '/auth/forgot-password',
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Sets a password from an invite token and establishes a session cookie.
 */
export const setPassword = async (body: SetPasswordRequest): Promise<AuthSessionResponse> => {
  const result = await apiFetch<AuthSessionResponse>({
    path: '/auth/set-password',
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });
  setCsrfTokenCache(result.csrfToken);
  markClientSessionHint();
  return result;
};

/**
 * Changes the authenticated user's password (CSRF-protected).
 */
export const changePassword = (body: ChangePasswordRequest): Promise<ChangePasswordResponse> =>
  apiFetch({
    path: '/auth/change-password',
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

/**
 * Revokes the current session and clears the cookie.
 */
export const logoutUser = async (): Promise<void> => {
  await apiFetch<void>({
    path: '/auth/logout',
    method: 'POST',
    credentials: 'include',
  });
  clearCsrfTokenCache();
  clearClientSessionHint();
};

/**
 * Fetches the authenticated user. Optionally forwards a Cookie header (SSR).
 * Anonymous sessions resolve as `undefined` (HTTP 204).
 */
export const getMe = (cookieHeader?: string): Promise<UserResponse | undefined> => {
  const options: Parameters<typeof apiFetch<UserResponse | undefined>>[0] = {
    path: '/auth/me',
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  };

  if (cookieHeader) {
    options.headers = { Cookie: cookieHeader };
  }

  return apiFetch<UserResponse | undefined>(options);
};
/**
 * Returns the current user or `null` when unauthenticated.
 * Skips the network call when no session cookie / CSRF hint is present (guest).
 * Nest still returns 204 for cookie-less probes as a safety net.
 */
export const getMeOrNull = async (cookieHeader?: string): Promise<UserResponse | null> => {
  const hasHint =
    typeof cookieHeader === 'string'
      ? hasSessionCookieInHeader(cookieHeader)
      : hasClientSessionHint();

  if (!hasHint) {
    return null;
  }

  try {
    const user = await getMe(cookieHeader);
    return user ?? null;
  } catch (error) {
    if (isApiErrorStatus(error, 401)) {
      return null;
    }
    throw error;
  }
};

export { ApiError, isApiErrorStatus };
