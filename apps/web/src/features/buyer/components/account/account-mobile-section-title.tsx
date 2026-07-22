'use client';

import { useTranslations } from 'next-intl';

import { usePathname } from '@/i18n/navigation';

type NavKey = 'overview' | 'password' | 'qr' | 'requests' | 'favorites' | 'checkin';

const resolveNavKey = (pathname: string): NavKey => {
  if (pathname.startsWith('/settings/password')) {
    return 'password';
  }
  if (pathname.startsWith('/settings/qr')) {
    return 'qr';
  }
  if (pathname.startsWith('/settings/requests')) {
    return 'requests';
  }
  if (pathname.startsWith('/settings/favorites')) {
    return 'favorites';
  }
  if (pathname.startsWith('/settings/checkin')) {
    return 'checkin';
  }
  return 'overview';
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
