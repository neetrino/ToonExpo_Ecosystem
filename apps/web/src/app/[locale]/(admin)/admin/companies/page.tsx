import { getTranslations, setRequestLocale } from 'next-intl/server';

import { loadAllCompanies } from '@/lib/admin/queries';

import { CompaniesTable } from './companies-table';
import { NewCompanyButton } from './new-company-button';

type AdminCompaniesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCompaniesPage({ params }: AdminCompaniesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, companies] = await Promise.all([
    getTranslations('admin.companies'),
    loadAllCompanies(),
  ]);

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
