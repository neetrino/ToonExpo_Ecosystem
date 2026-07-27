import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { AccountShell } from '@/features/buyer/components/account/account-shell';
import { isBuyerAccount } from '@/features/buyer/utils/is-buyer-account';
import { getMeOrNullCached as getMeOrNull } from '@/features/auth/api/get-me-or-null-cached';
import { redirect } from '@/i18n/navigation';
import { SiteHeader } from '@/shared/ui/site-header';

type CheckinLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * `/checkin` shell:
 * - buyers → account rail (status page)
 * - entrance staff → scanner under public SiteHeader
 * - platform admins → `/admin/checkin`
 */
export default async function CheckinLayout({ children, params }: CheckinLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login?returnUrl=%2Fcheckin', locale });
    return null;
  }

  if (user.accountType === 'platform_admin') {
    redirect({ href: '/admin/checkin', locale });
    return null;
  }

  if (isBuyerAccount(user)) {
    return <AccountShell locale={locale}>{children}</AccountShell>;
  }

  if (user.accountType !== 'entrance_staff') {
    notFound();
  }

  return (
    <div className="min-h-fluid-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-content px-6 py-8">{children}</main>
    </div>
  );
}
