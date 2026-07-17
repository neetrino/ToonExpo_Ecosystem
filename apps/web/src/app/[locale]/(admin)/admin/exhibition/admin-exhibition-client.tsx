'use client';

import { EXHIBITION_EVENT_STATUSES, type ExhibitionEventStatus } from '@toonexpo/domain';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  loadExhibitionEvents,
  loadRecentCheckIns,
  type AdminExhibitionEventRow,
  type AdminRecentCheckInRow,
} from '@/lib/admin/exhibition-queries';

import { EventsTable } from './events-table';
import { NewEventButton } from './new-event-button';

type ExhibitionPageData = {
  events: AdminExhibitionEventRow[];
  recent: AdminRecentCheckInRow[];
};

export function AdminExhibitionClient() {
  const locale = useLocale();
  const t = useTranslations('admin.exhibition');
  const [data, setData] = useState<ExhibitionPageData | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [events, recent] = await Promise.all([loadExhibitionEvents(), loadRecentCheckIns()]);
      if (cancelled) {
        return;
      }
      setData({ events, recent });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
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
  const statusLabels = Object.fromEntries(
    EXHIBITION_EVENT_STATUSES.map((status) => [status, t(`form.statuses.${status}`)]),
  ) as Record<ExhibitionEventStatus, string>;

  return (
    <section>
      <div className="portal-page__header">
        <h2 className="portal-page__title">{t('title')}</h2>
        <div className="portal-toolbar">
          <NewEventButton locale={locale} label={t('newEvent')} />
        </div>
      </div>

      {data.events.length === 0 ? (
        <p className="portal-empty">{t('empty')}</p>
      ) : (
        <EventsTable
          locale={locale}
          events={data.events}
          labels={{
            columns: {
              name: t('columns.name'),
              code: t('columns.code'),
              status: t('columns.status'),
              checkIns: t('columns.checkIns'),
              dates: t('columns.dates'),
              actions: t('columns.actions'),
            },
            edit: t('edit'),
            venueMap: t('venueMap'),
            noDates: t('noDates'),
          }}
          statusLabels={statusLabels}
        />
      )}

      <section className="portal-section" aria-labelledby="recent-checkins-heading">
        <h3 id="recent-checkins-heading" className="portal-page__subtitle">
          {t('recent.title')}
        </h3>
        {data.recent.length === 0 ? (
          <p className="portal-empty">{t('recent.empty')}</p>
        ) : (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>{t('recent.columns.visitor')}</th>
                  <th>{t('recent.columns.event')}</th>
                  <th>{t('recent.columns.staff')}</th>
                  <th>{t('recent.columns.checkedInAt')}</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((row) => (
                  <tr key={row.id}>
                    <td>{row.buyerName?.trim() || t('recent.unnamed')}</td>
                    <td>{row.eventName}</td>
                    <td>{row.staffName?.trim() || t('recent.unnamed')}</td>
                    <td>{dateFormatter.format(new Date(row.checkedInAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
