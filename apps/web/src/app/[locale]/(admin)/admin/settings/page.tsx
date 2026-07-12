import type { PlatformSettingKey } from '@toonexpo/contracts';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { loadAllPlatformSettings } from '@/lib/admin/settings-queries';

import { SettingsTable } from './settings-table';

type AdminSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminSettingsPage({ params }: AdminSettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, settings] = await Promise.all([
    getTranslations('admin.settings'),
    loadAllPlatformSettings(),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const keyLabels = Object.fromEntries(
    (['CONTACT_EMAIL', 'CONTACT_PHONE', 'MORTGAGE_PAGE_ENABLED'] as PlatformSettingKey[]).map(
      (key) => [key, t(`keys.${key}`)],
    ),
  ) as Record<PlatformSettingKey, string>;

  return (
    <section>
      <div className="portal-page__header">
        <h2 className="portal-page__title">{t('title')}</h2>
        <p className="portal-page__subtitle">{t('subtitle')}</p>
      </div>

      <SettingsTable
        locale={locale}
        settings={settings}
        labels={{
          columns: {
            key: t('columns.key'),
            value: t('columns.value'),
            updatedAt: t('columns.updatedAt'),
            actions: t('columns.actions'),
          },
          edit: t('edit'),
          unset: t('unset'),
          keys: keyLabels,
        }}
        formatDate={(date) => dateFormatter.format(date)}
      />
    </section>
  );
}
