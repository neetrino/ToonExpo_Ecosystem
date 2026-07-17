import { loadWebEnv } from '@/lib/env';

import { ApiClientError, mapAuthErrorCode } from './errors';

const CSRF_COOKIE_NAME = 'toonexpo.csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Forward Cookie header (RSC / server actions). */
  cookie?: string;
  /** Forward double-submit token for server-side mutations. */
  csrfToken?: string;
  /** Skip CSRF header (safe methods only). */
  skipCsrf?: boolean;
};

function resolveBrowserBaseUrl(): string {
  const env = loadWebEnv();
  return env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
}

function resolveServerBaseUrl(): string {
  const env = loadWebEnv();
  if (env.API_URL) {
    return env.API_URL.replace(/\/$/, '');
  }
  if (env.NEXT_PUBLIC_API_URL.startsWith('/')) {
    return `${env.APP_URL.replace(/\/$/, '')}${env.NEXT_PUBLIC_API_URL}`;
  }
  return env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
}

function readBrowserCsrfToken(): string | null {
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

async function ensureBrowserCsrfToken(baseUrl: string): Promise<string> {
  const existing = readBrowserCsrfToken();
  if (existing) {
    return existing;
  }

  const response = await fetch(`${baseUrl}/auth/csrf`, {
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

/**
 * Typed fetch wrapper for the NestJS API.
 * Browser calls use credentials; mutating calls send double-submit CSRF.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer ? resolveServerBaseUrl() : resolveBrowserBaseUrl();
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
    headers[CSRF_HEADER_NAME] = await ensureBrowserCsrfToken(baseUrl);
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
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
    throw await parseError(response);
  }

  return (await response.json()) as T;
}
