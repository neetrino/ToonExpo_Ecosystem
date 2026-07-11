import { getTranslations, setRequestLocale } from 'next-intl/server';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { loadCompanyProjects } from '@/lib/builder/queries';

import { NewProjectButton } from './new-project-button';
import { ProjectsTable } from './projects-table';

type PortalProjectsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PortalProjectsPage({ params }: PortalProjectsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const builderContext = await assertBuilderSession();
  if (!builderContext) {
    return null;
  }

  const [t, tStatus, projects] = await Promise.all([
    getTranslations('portal.projects'),
    getTranslations('portal.projects.status'),
    loadCompanyProjects(builderContext.companyId),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  return (
    <section>
      <div className="portal-page__header">
        <h2 className="portal-page__title">{t('title')}</h2>
        <div className="portal-toolbar">
          <NewProjectButton locale={locale} label={t('newProject')} />
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="portal-empty">{t('empty')}</p>
      ) : (
        <ProjectsTable
          locale={locale}
          projects={projects}
          labels={{
            noCity: t('noCity'),
            columns: {
              name: t('columns.name'),
              city: t('columns.city'),
              status: t('columns.status'),
              buildings: t('columns.buildings'),
              updatedAt: t('columns.updatedAt'),
              actions: t('columns.actions'),
            },
          }}
          statusLabels={{
            DRAFT: tStatus('DRAFT'),
            PUBLISHED: tStatus('PUBLISHED'),
            ARCHIVED: tStatus('ARCHIVED'),
          }}
          formatDate={(date) => dateFormatter.format(date)}
        />
      )}
    </section>
  );
}
