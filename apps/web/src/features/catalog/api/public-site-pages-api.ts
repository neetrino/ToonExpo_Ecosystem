import type { PublicSitePagesResponse } from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';
import { publicSitePagesFetch } from '@/shared/api/public-fetch';

/**
 * Anonymous visibility map for public marketing pages.
 */
export const getPublicSitePages = (): Promise<PublicSitePagesResponse> =>
  apiFetch<PublicSitePagesResponse>({
    path: '/site/public-pages',
    ...publicSitePagesFetch(),
  });
