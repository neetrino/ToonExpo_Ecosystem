import type { AuthSession } from '@toonexpo/contracts';

import { getApiErrorKey } from '@/lib/api/errors';
import { serverApiRequest } from '@/lib/api/server';

export type BuilderSessionContext = {
  session: AuthSession;
  companyId: string;
  companySlug: string;
  companyName: string;
  /** True when a BIGPROJECTS_ADMIN is operating via active-company cookie. */
  actingOnBehalf: boolean;
  /** Builder membership count; 0 for admin acting-on-behalf. */
  membershipCount: number;
};

/**
 * Returns builder-portal session context when the caller may operate as a
 * builder company: BUILDER (membership-scoped) or BIGPROJECTS_ADMIN with a
 * valid active-company cookie. Other roles → null.
 *
 * Server actions and portal routes must use this instead of layout guards.
 */
export async function assertBuilderSession(): Promise<BuilderSessionContext | null> {
  try {
    return await serverApiRequest<BuilderSessionContext>('/builder/context');
  } catch (error) {
    if (getApiErrorKey(error) === 'unauthorized') {
      return null;
    }
    throw error;
  }
}
