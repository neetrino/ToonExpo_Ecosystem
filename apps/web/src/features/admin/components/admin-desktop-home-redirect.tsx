'use client';

import { useEffect } from 'react';

import { useMinWidth } from '@/shared/hooks/use-min-width';
import { useRouter } from '@/i18n/navigation';

/**
 * Desktop `/admin` used to land on companies — keep that, leave mobile on the hub.
 */
export const AdminDesktopHomeRedirect = () => {
  const isDesktop = useMinWidth();
  const router = useRouter();

  useEffect(() => {
    if (!isDesktop) {
      return;
    }
    router.replace('/admin/companies');
  }, [isDesktop, router]);

  return null;
};
