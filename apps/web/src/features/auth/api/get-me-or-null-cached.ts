import { cache } from 'react';

import { getMeOrNull } from '@/features/auth/api/auth-api';

/**
 * Request-scoped `/auth/me` dedupe for RSC (layout + page share one call).
 */
export const getMeOrNullCached = cache(getMeOrNull);
