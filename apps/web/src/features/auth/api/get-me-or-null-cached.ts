import { cache } from 'react';

import { getMeOrNull } from '@/features/auth/api/auth-api';
import { isNetworkFetchError } from '@/shared/api/errors';

/** Dev HMR / brief Nest restarts — keep portal layouts from bouncing to login. */
const ME_SSR_NETWORK_RETRY_COUNT = 3;
const ME_SSR_NETWORK_RETRY_DELAY_MS = 400;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * `/auth/me` with short retries on network blips, then request-scoped React `cache`.
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

/**
 * Request-scoped `/auth/me` dedupe for RSC (layout + page share one call).
 */
export const getMeOrNullCached = cache(getMeOrNullWithNetworkRetry);
