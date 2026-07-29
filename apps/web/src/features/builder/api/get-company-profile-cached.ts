import { cache } from 'react';
import type { CompanyProfileResponse } from '@toonexpo/contracts';

import { getCompanyProfile } from '@/features/builder/api/company-profile-api';

/**
 * Request-scoped `/company/me` dedupe for RSC (layout + page share one call).
 * Keyed by cookie string so `cache()` can dedupe (object args would not).
 */
export const getCompanyProfileCached = cache(
  (cookieHeader?: string): Promise<CompanyProfileResponse> => getCompanyProfile({ cookieHeader }),
);
