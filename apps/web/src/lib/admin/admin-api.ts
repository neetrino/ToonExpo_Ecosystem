import { cookies } from 'next/headers';

import { apiRequest } from '@/lib/api/client';

const CSRF_COOKIE_NAME = 'toonexpo.csrf';

/**
 * Calls the authenticated NestJS admin API from a Server Component or action.
 */
export async function adminApiRequest<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown } = {},
): Promise<T> {
  const cookieStore = await cookies();
  return apiRequest<T>(`/admin${path}`, {
    ...options,
    cookie: cookieStore.toString(),
    csrfToken: cookieStore.get(CSRF_COOKIE_NAME)?.value,
  });
}
