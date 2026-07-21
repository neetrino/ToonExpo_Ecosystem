import type { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AdminSettingsNav } from '@/features/admin/components/admin-settings-nav';

type AdminSettingsLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Admin settings section chrome: page title + profile/password tabs.
 */
export default async function AdminSettingsLayout({ children, params }: AdminSettingsLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Admin.settings');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-ink">{t('title')}</h1>
        <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>
      <AdminSettingsNav />
      {children}
    </div>
  );
}
