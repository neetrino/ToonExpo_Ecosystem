import type { PublicVenueMapSnapshotResponse } from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';
import { ApiError, isApiErrorStatus } from '@/shared/api/errors';
import { venueMapFetch } from '@/shared/api/public-fetch';

/**
 * Returns the active BOS venue-map snapshot, or null when none is published.
 */
export const getPublicVenueMapCurrent = async (): Promise<PublicVenueMapSnapshotResponse | null> => {
  try {
    return await apiFetch<PublicVenueMapSnapshotResponse>({
      path: '/venue-map/current',
      ...venueMapFetch(),
    });
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      return null;
    }
    throw error;
  }
};

export { ApiError, isApiErrorStatus };
