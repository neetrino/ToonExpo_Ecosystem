'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  loadIntegrationAuditLogs,
  type IntegrationAuditLogRow,
} from '@/lib/admin/integration-queries';

export function AdminIntegrationsClient() {
  const locale = useLocale();
  const t = useTranslations('admin.integrations');
  const [rows, setRows] = useState<IntegrationAuditLogRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = await loadIntegrationAuditLogs();
      if (cancelled) {
        return;
      }
      setRows(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
                  <td>{dateFormatter.format(new Date(row.createdAt))}</td>
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
