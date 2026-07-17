import { buildApiUrl, resolveApiBaseUrl } from '@/lib/api/base-url';

import { ApiClientError, mapAuthErrorCode } from './errors';

const CSRF_COOKIE_NAME = 'toonexpo.csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

/** In-memory CSRF token — cross-origin API cookies are not visible on document.cookie. */
let cachedBrowserCsrfToken: string | null = null;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /**
   * Optional Cookie header for rare server-to-server public calls.
   * Cross-origin Nest session cookies are not available to Next.js — authenticated
   * browser traffic must rely on `credentials: 'include'` instead.
   */
  cookie?: string;
  /** Forward double-submit token when the caller already has it. */
  csrfToken?: string;
  /** Skip CSRF header (safe methods only). */
  skipCsrf?: boolean;
};

/** Clears the in-memory CSRF cache (tests and CSRF_REJECTED recovery). */
export function clearCachedBrowserCsrfToken(): void {
  cachedBrowserCsrfToken = null;
}

function readBrowserCsrfToken(): string | null {
  if (cachedBrowserCsrfToken) {
    return cachedBrowserCsrfToken;
  }
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CSRF_COOKIE_NAME}=`));
  if (!match) {
    return null;
  }
  return decodeURIComponent(match.slice(CSRF_COOKIE_NAME.length + 1));
}

async function ensureBrowserCsrfToken(): Promise<string> {
  const existing = readBrowserCsrfToken();
  if (existing) {
    cachedBrowserCsrfToken = existing;
    return existing;
  }

  const response = await fetch(buildApiUrl('/auth/csrf'), {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new ApiClientError(response.status, 'UNKNOWN', 'Failed to obtain CSRF token');
  }
  const data = (await response.json()) as { csrfToken?: string };
  if (!data.csrfToken) {
    throw new ApiClientError(response.status, 'UNKNOWN', 'CSRF token missing in response');
  }
  cachedBrowserCsrfToken = data.csrfToken;
  return data.csrfToken;
}

async function parseError(response: Response): Promise<ApiClientError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }

  const code =
    body && typeof body === 'object' && 'code' in body && typeof body.code === 'string'
      ? mapAuthErrorCode(body.code)
      : 'UNKNOWN';
  const message =
    body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
      ? body.message
      : response.statusText || 'Request failed';

  return new ApiClientError(response.status, code, message, body);
}

async function executeApiRequest<T>(
  path: string,
  options: RequestOptions,
  isCsrfRetry: boolean,
): Promise<T> {
  const method = options.method ?? 'GET';
  const isServer = typeof window === 'undefined';
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.cookie) {
    headers.Cookie = options.cookie;
  }
  if (options.csrfToken) {
    headers[CSRF_HEADER_NAME] = options.csrfToken;
  }

  const needsCsrf = !options.skipCsrf && method !== 'GET';
  if (needsCsrf && !isServer) {
    headers[CSRF_HEADER_NAME] = await ensureBrowserCsrfToken();
  }

  let response: Response;
  try {
    response = await fetch(buildApiUrl(path), {
      method,
      headers,
      credentials: 'include',
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: 'no-store',
    });
  } catch {
    throw new ApiClientError(0, 'NETWORK', 'Network request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const error = await parseError(response);
    if (
      !isCsrfRetry &&
      !isServer &&
      needsCsrf &&
      error.code === 'CSRF_REJECTED'
    ) {
      clearCachedBrowserCsrfToken();
      return executeApiRequest(path, options, true);
    }
    throw error;
  }

  return (await response.json()) as T;
}

/**
 * Typed fetch wrapper for the NestJS API.
 * Always sends credentials so cross-origin httpOnly session cookies are included.
 * Mutating browser calls send double-submit CSRF.
 * On CSRF_REJECTED, clears the cached token, re-fetches CSRF, and retries once.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return executeApiRequest(path, options, false);
}

export { resolveApiBaseUrl, buildApiUrl };
