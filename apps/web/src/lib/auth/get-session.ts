import { authSessionSchema, type AuthSession } from '@toonexpo/contracts';
import { cookies } from 'next/headers';

import { apiRequest } from '@/lib/api';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';

/**
 * Resolves the current Nest-backed session for Server Components / actions.
 * Returns null when unauthenticated or the session cookie is missing/invalid.
 */
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    const raw = await apiRequest<unknown>('/auth/me', {
      cookie: `${SESSION_COOKIE_NAME}=${token}`,
    });
    const parsed = authSessionSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Drop-in replacement for the former Auth.js `auth()` helper. */
export const auth = getSession;
