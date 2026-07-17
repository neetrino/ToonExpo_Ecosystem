'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { ProvisionForm } from '@/components/admin/provision-form';
import { UsersTable, type ProvisionedUserRow } from '@/components/admin/users-table';
import { DataRefreshProvider } from '@/components/portal-forms/data-refresh-context';
import {
  loadPartnerOptions,
  loadProvisionedUsers,
  type AdminPartnerOption,
} from '@/lib/admin/queries';

import { provisionAccountAction } from './actions';

type AdminHomeData = {
  users: ProvisionedUserRow[];
  partners: AdminPartnerOption[];
};

export function AdminHomeClient() {
  const locale = useLocale();
  const t = useTranslations('admin');
  const [data, setData] = useState<AdminHomeData | null>(null);

  const loadHome = useCallback(async () => {
    const [users, partners] = await Promise.all([loadProvisionedUsers(), loadPartnerOptions()]);
    setData({ users, partners });
  }, []);

  useEffect(() => {
    void loadHome();
  }, [loadHome]);

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  return (
    <DataRefreshProvider refresh={loadHome}>
      <section className="portal-section">
        <header className="portal-section__header">
          <div>
            <h2 className="portal-page__title">{t('provision.title')}</h2>
            <p className="portal-muted">{t('provision.description')}</p>
          </div>
        </header>

        <ProvisionForm action={provisionAccountAction.bind(null, locale)} partners={data.partners} />
        <UsersTable users={data.users} locale={locale} />
      </section>
    </DataRefreshProvider>
  );
}
