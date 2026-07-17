import { authSessionSchema, type AuthSession } from '@toonexpo/contracts';

import { apiRequest } from '@/lib/api/client';

/**
 * Browser session restore via Nest `/auth/me` (credentials include).
 * Do not call from RSC — Nest cookies are not on the Next.js domain.
 */
export async function getSession(): Promise<AuthSession | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = await apiRequest<unknown>('/auth/me');
    const parsed = authSessionSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Drop-in replacement for the former Auth.js `auth()` helper (browser only). */
export const auth = getSession;
