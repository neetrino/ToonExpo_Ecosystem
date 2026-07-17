import { apiRequest } from '@/lib/api/client';

/**
 * Calls the authenticated NestJS admin API from the browser
 * (`credentials: 'include'` + CSRF via apiRequest).
 */
export async function adminApiRequest<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown } = {},
): Promise<T> {
  return apiRequest<T>(`/admin${path}`, options);
}
