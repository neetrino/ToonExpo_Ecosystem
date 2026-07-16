import { getTranslations, setRequestLocale } from 'next-intl/server';

import { loadActiveExhibitionEvent } from '@/lib/exhibition/queries';

type EntranceCheckInPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function EntranceCheckInPage({ params }: EntranceCheckInPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, event] = await Promise.all([
    getTranslations('entrance.checkin'),
    loadActiveExhibitionEvent(),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  return (
    <section className="portal-shell">
      <header className="portal-page__header">
        <div>
          <h1 className="portal-page__title">{t('title')}</h1>
          <p className="portal-muted">{t.raw('subtitle')}</p>
        </div>
      </header>

      {event ? (
        <div className="portal-card">
          <h2 className="portal-card__title">{event.name}</h2>
          <p className="portal-muted">{t('eventCode', { code: event.code })}</p>
          {event.startDate || event.endDate ? (
            <p className="portal-muted">
              {t('eventDates', {
                start: event.startDate ? dateFormatter.format(event.startDate) : t('dateOpen'),
                end: event.endDate ? dateFormatter.format(event.endDate) : t('dateOpen'),
              })}
            </p>
          ) : null}
          <p className="portal-muted">{t('instruction')}</p>
        </div>
      ) : (
        <p className="portal-empty">{t('noActiveEvent')}</p>
      )}
    </section>
  );
}
