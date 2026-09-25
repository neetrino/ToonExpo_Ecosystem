import type { ReactNode } from 'react';

import { requirePublicPageEnabled } from '@/features/catalog/utils/require-public-page-enabled';

type Props = {
  children: ReactNode;
};

/**
 * Gates this public section when the page is deactivated in admin settings.
 */
export default async function PublicPageGateLayout({ children }: Props) {
  await requirePublicPageEnabled('expo');
  return children;
}
