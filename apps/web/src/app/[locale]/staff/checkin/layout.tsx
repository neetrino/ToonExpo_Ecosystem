import { headers } from 'next/headers';
import { getLocale, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { getMeOrNullCached as getMeOrNull } from '@/features/auth/api/get-me-or-null-cached';
import { redirect } from '@/i18n/navigation';
import { SiteHeader } from '@/shared/ui/site-header';

type StaffCheckinLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Entrance-staff scanner chrome (public site header — not the buyer account rail).
 */
export default async function StaffCheckinLayout({ children, params }: StaffCheckinLayoutProps) {
  const { locale: urlLocale } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login?returnUrl=%2Fstaff%2Fcheckin', locale: urlLocale });
    return null;
  }

  if (user.accountType === 'platform_admin') {
    redirect({ href: '/admin/checkin', locale: urlLocale });
    return null;
  }

  if (user.accountType !== 'entrance_staff') {
    redirect({ href: '/checkin', locale: urlLocale });
    return null;
  }

  return (
    <div className="min-h-fluid-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-content px-6 py-8">{children}</main>
    </div>
  );
}
