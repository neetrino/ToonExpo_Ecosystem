import type { PublicationStatus } from '@toonexpo/domain';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { loadCompanyProjects } from '@/lib/builder/queries';

type PortalProjectsPageProps = {
  params: Promise<{ locale: string }>;
};

const STATUS_BADGE_CLASS: Record<PublicationStatus, string> = {
  DRAFT: 'portal-badge portal-badge--draft',
  PUBLISHED: 'portal-badge portal-badge--published',
  ARCHIVED: 'portal-badge portal-badge--archived',
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
      <h2 className="portal-page__title">{t('title')}</h2>
      {projects.length === 0 ? (
        <p className="portal-empty">{t('empty')}</p>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>{t('columns.name')}</th>
                <th>{t('columns.city')}</th>
                <th>{t('columns.status')}</th>
                <th>{t('columns.buildings')}</th>
                <th>{t('columns.updatedAt')}</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{project.city ?? t('noCity')}</td>
                  <td>
                    <span className={STATUS_BADGE_CLASS[project.status]}>
                      {tStatus(project.status)}
                    </span>
                  </td>
                  <td>{project.buildingsCount}</td>
                  <td>{dateFormatter.format(project.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
