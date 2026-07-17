import { cookies } from 'next/headers';

import { apiRequest } from './client';

const CSRF_COOKIE_NAME = 'toonexpo.csrf';

type ServerRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
};

/** Calls Nest from RSC/server actions with the incoming auth and CSRF cookies. */
export async function serverApiRequest<T>(
  path: string,
  options: ServerRequestOptions = {},
): Promise<T> {
  const cookieStore = await cookies();
  const cookie = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
  const csrfToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  return apiRequest<T>(path, {
    ...options,
    cookie,
    csrfToken,
  });
}
