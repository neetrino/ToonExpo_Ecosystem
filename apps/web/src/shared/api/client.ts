import { API_V1_PREFIX } from '@toonexpo/contracts';

import { getPublicEnv, getServerApiBaseUrl } from '@/shared/config/env';

import { clearCsrfTokenCache, isMutatingMethod, redirectToLogin, withCsrfHeaders } from './csrf';
import { ApiError } from './errors';

/** Public auth mutations establish the session; CSRF is not available yet. */
const CSRF_EXEMPT_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/set-password',
  '/auth/forgot-password',
  /** Public calculator; @Public() on API and no session for anonymous visitors. */
  '/mortgage/calculate',
]);

export type ApiFetchOptions = RequestInit & {
  /** Absolute or relative path under the API v1 prefix (e.g. `/health`). */
  path: string;
  /** Internal: prevents infinite CSRF refresh retries. */
  csrfRetryAttempted?: boolean;
};

const resolveApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return getPublicEnv().apiBaseUrl;
  }

  return getServerApiBaseUrl();
};

/**
 * Builds an API v1 URL from a path segment.
 * Browser proxy mode uses same-origin relative URLs when the public base is empty.
 */
export const buildApiUrl = (path: string, baseUrl?: string): string => {
  const origin = (baseUrl ?? resolveApiBaseUrl()).replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!origin) {
    return `${API_V1_PREFIX}${normalizedPath}`;
  }

  return `${origin}${API_V1_PREFIX}${normalizedPath}`;
};

const isEmptyBody = (response: Response): boolean => {
  if (response.status === 204 || response.status === 205) {
    return true;
  }

  const length = response.headers.get('content-length');
  return length === '0';
};

const toHeaderRecord = (headers: HeadersInit | undefined): Record<string, string> => {
  const merged: Record<string, string> = { Accept: 'application/json' };

  if (!headers) {
    return merged;
  }

  new Headers(headers).forEach((value, key) => {
    merged[key] = value;
  });

  return merged;
};

/**
 * Typed fetch wrapper for NestJS `/api/v1` endpoints.
 * Throws {@link ApiError} on non-OK responses; callers handle domain failures.
 * Authenticated mutations attach X-CSRF-Token; one 403 CSRF refresh+retry is attempted.
 */
export const apiFetch = async <T>(options: ApiFetchOptions): Promise<T> => {
  const { path, csrfRetryAttempted = false, ...init } = options;
  const mutating = isMutatingMethod(init.method);
  const requiresCsrf = mutating && !CSRF_EXEMPT_PATHS.has(path);
  const headers = requiresCsrf ? await withCsrfHeaders(init.headers) : toHeaderRecord(init.headers);

  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers,
  });

  if (
    response.status === 403 &&
    requiresCsrf &&
    !csrfRetryAttempted &&
    typeof window !== 'undefined'
  ) {
    clearCsrfTokenCache();

    try {
      return await apiFetch<T>({
        ...options,
        csrfRetryAttempted: true,
      });
    } catch {
      redirectToLogin();
      throw new ApiError(response.status, response.statusText);
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  if (isEmptyBody(response)) {
    return undefined as T;
  }

  return (await response.json()) as T;
};
