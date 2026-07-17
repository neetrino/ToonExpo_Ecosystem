'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { loadAllCompanies, type AdminCompanyRow } from '@/lib/admin/queries';

import { CompaniesTable } from './companies-table';
import { NewCompanyButton } from './new-company-button';

export function AdminCompaniesClient() {
  const locale = useLocale();
  const t = useTranslations('admin.companies');
  const [companies, setCompanies] = useState<AdminCompanyRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = await loadAllCompanies();
      if (cancelled) {
        return;
      }
      setCompanies(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!companies) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  return (
    <section>
      <div className="portal-page__header">
        <h2 className="portal-page__title">{t('title')}</h2>
        <div className="portal-toolbar">
          <NewCompanyButton locale={locale} label={t('newCompany')} />
        </div>
      </div>

      {companies.length === 0 ? (
        <p className="portal-empty">{t('empty')}</p>
      ) : (
        <CompaniesTable
          locale={locale}
          companies={companies}
          labels={{
            columns: {
              name: t('columns.name'),
              slug: t('columns.slug'),
              members: t('columns.members'),
              projects: t('columns.projects'),
              createdAt: t('columns.createdAt'),
              actions: t('columns.actions'),
            },
            edit: t('edit'),
            openInPortal: t('openInPortal'),
            projectCounts: {
              draft: t('projectCounts.draft'),
              published: t('projectCounts.published'),
              archived: t('projectCounts.archived'),
            },
          }}
        />
      )}
    </section>
  );
}
