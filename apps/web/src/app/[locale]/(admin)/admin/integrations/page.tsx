import { getTranslations, setRequestLocale } from 'next-intl/server';

import { loadIntegrationAuditLogs } from '@/lib/admin/integration-queries';

type AdminIntegrationsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminIntegrationsPage({ params }: AdminIntegrationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, rows] = await Promise.all([
    getTranslations('admin.integrations'),
    loadIntegrationAuditLogs(),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <section>
      <div className="portal-page__header">
        <h2 className="portal-page__title">{t('title')}</h2>
        <p className="portal-page__subtitle">{t('subtitle')}</p>
      </div>

      {rows.length === 0 ? (
        <p className="portal-empty">{t('empty')}</p>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>{t('columns.createdAt')}</th>
                <th>{t('columns.direction')}</th>
                <th>{t('columns.operation')}</th>
                <th>{t('columns.status')}</th>
                <th>{t('columns.externalRef')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{dateFormatter.format(row.createdAt)}</td>
                  <td>{t(`directions.${row.direction}`)}</td>
                  <td>{row.operation}</td>
                  <td>{t(`statuses.${row.status}`)}</td>
                  <td>{row.externalRef ?? t('externalRefEmpty')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
