import type { PublicHomeHero } from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';
import { homeHeroFetch } from '@/shared/api/public-fetch';

/**
 * Anonymous public home hero (null imageUrl → use default static asset).
 */
export const getPublicHomeHero = async (): Promise<PublicHomeHero> =>
  apiFetch<PublicHomeHero>({
    path: '/site/home-hero',
    ...homeHeroFetch(),
  });
