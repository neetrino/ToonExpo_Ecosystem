import type { UserResponse } from '@toonexpo/contracts';

import { isNetworkFetchError } from '@/shared/api/errors';

export type MeSession = { status: 'ready'; user: UserResponse | null } | { status: 'unavailable' };

/**
 * Maps `/auth/me` to a session result. Network failures stay `unavailable`
 * so portal layouts can render recovery UI instead of throwing (Next overlay).
 */
export const lookupMeSession = async (
  load: () => Promise<UserResponse | null>,
): Promise<MeSession> => {
  try {
    return { status: 'ready', user: await load() };
  } catch (error) {
    if (isNetworkFetchError(error)) {
      return { status: 'unavailable' };
    }
    throw error;
  }
};
