import { apiRequest } from './client';

type ServerRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
};

/**
 * Nest fetch helper used by RSC for **public** endpoints (no session cookie).
 * Authenticated calls must use browser `apiRequest` (`credentials: 'include'`)
 * because Next.js cannot read cookies set by the Nest/Cloud Run origin.
 */
export async function serverApiRequest<T>(
  path: string,
  options: ServerRequestOptions = {},
): Promise<T> {
  return apiRequest<T>(path, options);
}
