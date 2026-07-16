import type { Session } from 'next-auth';

import { auth } from '@/auth';

/**
 * Returns the current session when the caller is entrance staff; otherwise null.
 * Server actions must use this instead of layout guards, which do not run for actions.
 */
export async function assertEntranceSession(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ENTRANCE_STAFF') {
    return null;
  }
  return session;
}
