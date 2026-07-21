import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ProfileNav } from '@/features/buyer/components/profile-nav';
import { getMeOrNull } from '@/features/auth/api/auth-api';
import { redirect } from '@/i18n/navigation';
import { SiteHeader } from '@/shared/ui/site-header';

type ProfileLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Authenticated buyer cabinet shell with mobile-first section tabs.
 */
export default async function ProfileLayout({ children, params }: ProfileLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({
      href: '/auth/login?returnUrl=%2Fprofile',
      locale,
    });
    return null;
  }

  const t = await getTranslations('Profile');

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-2">
          <p className="text-eyebrow">{t('cabinetTitle')}</p>
          <h1 className="text-page-title text-ink">{user.name}</h1>
          <p className="text-sm text-ink-secondary">{t('cabinetSubtitle')}</p>
        </div>
        <ProfileNav />
        <div className="rounded-md border border-border/80 bg-surface-elevated p-4 shadow-xs sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
