import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  type CsrfTokenResponse,
} from "@toonexpo/contracts";

import { SUPPORTED_LOCALES } from "@toonexpo/shared";

import { buildApiUrl } from "./client";
import { ApiError } from "./errors";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let csrfTokenCache: string | null = null;

/**
 * Stores a CSRF token from login/register for cross-origin clients.
 */
export const setCsrfTokenCache = (token: string): void => {
  csrfTokenCache = token;
};

/**
 * Clears the in-memory CSRF token (e.g. after logout or failed refresh).
 */
export const clearCsrfTokenCache = (): void => {
  csrfTokenCache = null;
};

/**
 * Reads the double-submit CSRF cookie when the API shares the document origin.
 */
export const readCsrfTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${CSRF_COOKIE_NAME}=`;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!match) {
    return null;
  }

  const value = match.slice(prefix.length);
  return value.length > 0 ? decodeURIComponent(value) : null;
};

export const isMutatingMethod = (method: string | undefined): boolean => {
  if (!method) {
    return false;
  }

  return MUTATING_METHODS.has(method.toUpperCase());
};

/**
 * Resolves a CSRF token: cookie (same-origin) → memory cache → GET /auth/csrf.
 */
export const resolveCsrfToken = async (): Promise<string> => {
  const fromCookie = readCsrfTokenFromCookie();

  if (fromCookie) {
    return fromCookie;
  }

  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  const response = await fetch(buildApiUrl("/auth/csrf"), {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  const body = (await response.json()) as CsrfTokenResponse;
  setCsrfTokenCache(body.csrfToken);
  return body.csrfToken;
};

/**
 * Builds headers for a mutating request, including X-CSRF-Token when possible.
 */
export const withCsrfHeaders = async (
  headers: HeadersInit | undefined,
): Promise<Record<string, string>> => {
  const merged: Record<string, string> = {
    Accept: "application/json",
  };

  if (headers) {
    const normalized = new Headers(headers);
    normalized.forEach((value, key) => {
      merged[key] = value;
    });
  }

  const token = await resolveCsrfToken();
  merged[CSRF_HEADER_NAME] = token;
  return merged;
};

/**
 * Soft redirect to the locale-prefixed login page after an unrecoverable CSRF failure.
 */
export const redirectToLogin = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  const segments = window.location.pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];
  const locale =
    maybeLocale &&
    (SUPPORTED_LOCALES as readonly string[]).includes(maybeLocale)
      ? maybeLocale
      : null;
  const prefix = locale ? `/${locale}` : "";
  window.location.assign(`${prefix}/auth/login`);
};
