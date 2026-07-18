import type {
  AuthSessionResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";
import {
  clearCsrfTokenCache,
  setCsrfTokenCache,
} from "@/shared/api/csrf";
import { ApiError, isApiErrorStatus } from "@/shared/api/errors";

const jsonCredentials = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json" },
};

/**
 * Registers a buyer and establishes a session cookie.
 */
export const registerUser = async (
  body: RegisterRequest,
): Promise<AuthSessionResponse> => {
  const result = await apiFetch<AuthSessionResponse>({
    path: "/auth/register",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });
  setCsrfTokenCache(result.csrfToken);
  return result;
};

/**
 * Logs in with email/password and establishes a session cookie.
 */
export const loginUser = async (
  body: LoginRequest,
): Promise<AuthSessionResponse> => {
  const result = await apiFetch<AuthSessionResponse>({
    path: "/auth/login",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });
  setCsrfTokenCache(result.csrfToken);
  return result;
};

/**
 * Revokes the current session and clears the cookie.
 */
export const logoutUser = async (): Promise<void> => {
  await apiFetch<void>({
    path: "/auth/logout",
    method: "POST",
    credentials: "include",
  });
  clearCsrfTokenCache();
};

/**
 * Fetches the authenticated user. Optionally forwards a Cookie header (SSR).
 */
export const getMe = (cookieHeader?: string): Promise<UserResponse> => {
  const options: Parameters<typeof apiFetch<UserResponse>>[0] = {
    path: "/auth/me",
    method: "GET",
    credentials: "include",
    cache: "no-store",
  };

  if (cookieHeader) {
    options.headers = { Cookie: cookieHeader };
  }

  return apiFetch<UserResponse>(options);
};
/**
 * Returns the current user or `null` when unauthenticated (401).
 */
export const getMeOrNull = async (
  cookieHeader?: string,
): Promise<UserResponse | null> => {
  try {
    return await getMe(cookieHeader);
  } catch (error) {
    if (isApiErrorStatus(error, 401)) {
      return null;
    }
    throw error;
  }
};

export { ApiError, isApiErrorStatus };
