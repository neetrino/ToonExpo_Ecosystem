import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { AccountShell } from '@/features/buyer/components/account/account-shell';
import { isBuyerAccount } from '@/features/buyer/utils/is-buyer-account';
import { getMeOrNull } from '@/features/auth/api/auth-api';
import { Link, redirect } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/shared/ui/locale-switcher';

type CheckinLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * `/checkin` shell:
 * - buyers → account rail (status page)
 * - entrance staff → staff scanner chrome
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

  const t = await getTranslations('Checkin');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-6 py-3">
          <Link
            href="/checkin"
            className="font-brand text-base font-extrabold tracking-tight text-ink"
          >
            <span>TOON</span>
            <span className="text-brand">EXPO</span>
            <span className="ml-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
              {t('badge')}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-secondary sm:inline">{user.email}</span>
            <LocaleSwitcher />
            <Link
              href="/dashboard"
              className="text-sm font-medium text-ink-secondary hover:text-ink"
            >
              {t('profileLink')}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-content px-6 py-8">{children}</main>
    </div>
  );
}
