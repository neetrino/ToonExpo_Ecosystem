'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  loadActiveExhibitionEvent,
  type ActiveExhibitionEvent,
} from '@/lib/exhibition/queries';

export function EntranceCheckInClient() {
  const locale = useLocale();
  const t = useTranslations('entrance.checkin');
  const [event, setEvent] = useState<ActiveExhibitionEvent | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = await loadActiveExhibitionEvent();
      if (cancelled) {
        return;
      }
      setEvent(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (event === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  return (
    <section className="portal-shell">
      <header className="portal-page__header">
        <div>
          <h1 className="portal-page__title">{t('title')}</h1>
          <p className="portal-muted">{t.raw('subtitle') as string}</p>
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
