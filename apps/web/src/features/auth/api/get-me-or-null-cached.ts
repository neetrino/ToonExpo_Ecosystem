import { cache } from 'react';

import { getMeOrNull } from '@/features/auth/api/auth-api';
import { isNetworkFetchError } from '@/shared/api/errors';

import { lookupMeSession, type MeSession } from './me-session';

export type { MeSession };

/** Dev HMR / Nest watch reboot — keep portal layouts from bouncing to login. */
const ME_SSR_NETWORK_RETRY_COUNT = 5;
const ME_SSR_NETWORK_RETRY_DELAY_MS = 500;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * `/auth/me` with short retries on network blips.
 */
const getMeOrNullWithNetworkRetry = async (cookieHeader?: string) => {
  let attempt = 0;

  for (;;) {
    try {
      return await getMeOrNull(cookieHeader);
    } catch (error) {
      if (!isNetworkFetchError(error) || attempt >= ME_SSR_NETWORK_RETRY_COUNT) {
        throw error;
      }
      attempt += 1;
      await wait(ME_SSR_NETWORK_RETRY_DELAY_MS * attempt);
    }
  }
};

const loadMeSession = async (cookieHeader?: string): Promise<MeSession> =>
  lookupMeSession(() => getMeOrNullWithNetworkRetry(cookieHeader));

/**
 * Request-scoped session lookup. `unavailable` means Nest never answered —
 * layouts must render recovery UI instead of throwing or faking logout.
 */
export const getMeSessionCached = cache(loadMeSession);
