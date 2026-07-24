'use client';

import type { CrmDealDetail } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';

type CrmDealReadonlyExtrasProps = {
  deal: CrmDealDetail;
};

/**
 * Read-only apartments / notes / activities for Admin CRM sheet.
 */
export const CrmDealReadonlyExtras = ({ deal }: CrmDealReadonlyExtrasProps) => {
  const t = useTranslations('CrmBoard');
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-sm border border-border p-3">
        <h3 className="mb-2 text-sm font-semibold text-ink">{t('apartmentsTitle')}</h3>
        {deal.apartments.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('apartmentsEmpty')}</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm text-ink">
            {deal.apartments.map((link) => (
              <li key={link.id}>
                #{link.apartmentNumber ?? link.apartmentId} · {link.linkType}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-sm border border-border p-3">
        <h3 className="mb-2 text-sm font-semibold text-ink">{t('notesTitle')}</h3>
        {deal.notes.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('notesEmpty')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {deal.notes.map((note) => (
              <li key={note.id} className="rounded-sm bg-surface px-3 py-2 text-sm">
                <p className="whitespace-pre-wrap text-ink">{note.body}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {note.authorName} · {formatBuyerDateTime(note.createdAt, locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-sm border border-border p-3">
        <h3 className="mb-2 text-sm font-semibold text-ink">{t('activitiesTitle')}</h3>
        {deal.activities.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('activitiesEmpty')}</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm text-ink">
            {deal.activities.map((activity) => (
              <li key={activity.id}>
                {activity.title}
                <span className="text-ink-muted"> · {activity.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
