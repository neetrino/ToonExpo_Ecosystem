'use client';

import { useTranslations } from 'next-intl';

import { usePathname } from '@/i18n/navigation';

type NavKey = 'dashboard' | 'password' | 'qr' | 'requests' | 'favorites' | 'checkin';

const resolveNavKey = (pathname: string): NavKey => {
  if (pathname === '/qr') {
    return 'qr';
  }
  if (pathname === '/requests' || pathname.startsWith('/requests/')) {
    return 'requests';
  }
  if (pathname === '/favorites' || pathname.startsWith('/favorites/')) {
    return 'favorites';
  }
  if (pathname === '/checkin') {
    return 'checkin';
  }
  if (pathname === '/settings' || pathname.startsWith('/settings/')) {
    return 'password';
  }
  return 'dashboard';
};

/**
 * Current account section label for the mobile shell header.
 */
export const AccountMobileSectionTitle = () => {
  const t = useTranslations('Profile.nav');
  const pathname = usePathname();
  const key = resolveNavKey(pathname);

  return (
    <p className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-ink">
      {t(key)}
    </p>
  );
};
