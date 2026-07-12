import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EXHIBITION_EVENT_STATUSES, type ExhibitionEventStatus } from '@toonexpo/domain';

import { loadExhibitionEvents, loadRecentCheckIns } from '@/lib/admin/exhibition-queries';

import { EventsTable } from './events-table';
import { NewEventButton } from './new-event-button';

type AdminExhibitionPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminExhibitionPage({ params }: AdminExhibitionPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, events, recent] = await Promise.all([
    getTranslations('admin.exhibition'),
    loadExhibitionEvents(),
    loadRecentCheckIns(),
  ]);

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

      {events.length === 0 ? (
        <p className="portal-empty">{t('empty')}</p>
      ) : (
        <EventsTable
          locale={locale}
          events={events}
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
            noDates: t('noDates'),
          }}
          statusLabels={statusLabels}
          formatDate={(date) => dateFormatter.format(date)}
        />
      )}

      <section className="portal-section" aria-labelledby="recent-checkins-heading">
        <h3 id="recent-checkins-heading" className="portal-page__subtitle">
          {t('recent.title')}
        </h3>
        {recent.length === 0 ? (
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
                {recent.map((row) => (
                  <tr key={row.id}>
                    <td>{row.buyerName?.trim() || t('recent.unnamed')}</td>
                    <td>{row.eventName}</td>
                    <td>{row.staffName?.trim() || t('recent.unnamed')}</td>
                    <td>{dateFormatter.format(row.checkedInAt)}</td>
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
