import type { AuthSession } from '@toonexpo/contracts';

import { auth } from '@/auth';

/**
 * Returns the current session when the caller is a platform admin; otherwise null.
 * Server actions must use this instead of layout guards, which do not run for actions.
 */
export async function assertAdminSession(): Promise<AuthSession | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'BIGPROJECTS_ADMIN') {
    return null;
  }
  return session;
}
