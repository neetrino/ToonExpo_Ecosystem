import type { PublicSitePageKey } from '@toonexpo/contracts';
import { notFound } from 'next/navigation';

import { getPublicSitePages } from '@/features/catalog/api/public-site-pages-api';

/**
 * Server-side gate: disabled marketing pages return 404 for visitors.
 */
export const requirePublicPageEnabled = async (key: PublicSitePageKey): Promise<void> => {
  try {
    const { pages } = await getPublicSitePages();
    if (pages[key] === false) {
      notFound();
    }
  } catch {
    // Fail open if settings API is unreachable — same as default-all-enabled.
  }
};
