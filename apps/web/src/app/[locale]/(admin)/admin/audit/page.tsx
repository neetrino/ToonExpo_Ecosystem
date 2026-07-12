import { AUDIT_ENTITY_TYPES } from '@toonexpo/domain';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { loadAuditLogs, parseAuditEntityTypeFilter } from '@/lib/admin/audit-queries';
import { Link } from '@/i18n/navigation';

type AdminAuditPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ entityType?: string }>;
};

export default async function AdminAuditPage({ params, searchParams }: AdminAuditPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { entityType: rawEntityType } = await searchParams;
  const entityType = parseAuditEntityTypeFilter(rawEntityType);

  const [t, rows] = await Promise.all([
    getTranslations('admin.audit'),
    loadAuditLogs(entityType),
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
        <p>
          <a className="portal-nav__link" href="/api/admin/reports/audit">
            {t('exportCsv')}
          </a>
        </p>
      </div>

      <nav className="portal-nav" aria-label={t('filter.ariaLabel')}>
        <Link className="portal-nav__link" href="/admin/audit" aria-current={!entityType ? 'page' : undefined}>
          {t('filter.all')}
        </Link>
        {AUDIT_ENTITY_TYPES.map((type) => (
          <Link
            key={type}
            className="portal-nav__link"
            href={`/admin/audit?entityType=${type}`}
            aria-current={entityType === type ? 'page' : undefined}
          >
            {t(`entityTypes.${type}`)}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="portal-empty">{t('empty')}</p>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>{t('columns.createdAt')}</th>
                <th>{t('columns.actor')}</th>
                <th>{t('columns.action')}</th>
                <th>{t('columns.entity')}</th>
                <th>{t('columns.detail')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{dateFormatter.format(row.createdAt)}</td>
                  <td>
                    {row.actorName ?? row.actorEmail ?? row.actorRole}
                    {row.actorEmail ? ` (${row.actorEmail})` : ''}
                  </td>
                  <td>{t(`actions.${row.action}`)}</td>
                  <td>
                    {t(`entityTypes.${row.entityType}`)} · {row.entityId}
                  </td>
                  <td>{row.detail ?? t('detailEmpty')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
