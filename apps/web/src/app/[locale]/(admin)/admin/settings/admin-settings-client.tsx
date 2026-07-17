'use client';

import type { PlatformSettingKey } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { loadAllPlatformSettings, type PlatformSettingRow } from '@/lib/admin/settings-queries';

import { SettingsTable } from './settings-table';

export function AdminSettingsClient() {
  const locale = useLocale();
  const t = useTranslations('admin.settings');
  const [settings, setSettings] = useState<PlatformSettingRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = await loadAllPlatformSettings();
      if (cancelled) {
        return;
      }
      setSettings(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!settings) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

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
      />
    </section>
  );
}
