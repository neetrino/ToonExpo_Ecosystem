'use client';

import { AUDIT_ENTITY_TYPES } from '@toonexpo/domain';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { buildApiUrl } from '@/lib/api/base-url';
import {
  loadAuditLogs,
  parseAuditEntityTypeFilter,
  type AuditLogRow,
} from '@/lib/admin/audit-queries';
import { Link } from '@/i18n/navigation';

export function AdminAuditClient() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const entityType = parseAuditEntityTypeFilter(searchParams.get('entityType'));
  const t = useTranslations('admin.audit');
  const [rows, setRows] = useState<AuditLogRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    void (async () => {
      const next = await loadAuditLogs(entityType);
      if (cancelled) {
        return;
      }
      setRows(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [entityType]);

  if (!rows) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

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
          <a className="portal-nav__link" href={buildApiUrl('/admin/reports/audit')}>
            {t('exportCsv')}
          </a>
        </p>
      </div>

      <nav className="portal-nav" aria-label={t('filter.ariaLabel')}>
        <Link
          className="portal-nav__link"
          href="/admin/audit"
          aria-current={!entityType ? 'page' : undefined}
        >
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
                  <td>{dateFormatter.format(new Date(row.createdAt))}</td>
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
