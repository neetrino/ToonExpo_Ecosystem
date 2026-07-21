'use client';

import type { BuyerCheckInStatusResponse } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { useBuyerCheckInQuery } from '@/features/buyer/hooks/use-buyer-checkin';
import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import { Link } from '@/i18n/navigation';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';

type CheckInHistoryListProps = {
  items: BuyerCheckInStatusResponse['history'];
};

const CheckInHistoryList = ({ items }: CheckInHistoryListProps) => {
  const t = useTranslations('Profile.checkin');
  const locale = useLocale();

  if (items.length === 0) {
    return <p className="text-sm text-ink-secondary">{t('history.empty')}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={`${item.eventId}-${item.checkedInAt}`}>
          <Card className="flex flex-col gap-1 !p-4 shadow-none">
            <p className="text-sm font-medium text-ink">{item.eventName}</p>
            <p className="text-xs text-ink-muted">
              {formatBuyerDateTime(item.checkedInAt, locale)}
            </p>
          </Card>
        </li>
      ))}
    </ul>
  );
};

/**
 * Buyer check-in status for the active event and past exhibitions.
 */
export const BuyerCheckInStatus = () => {
  const t = useTranslations('Profile.checkin');
  const locale = useLocale();
  const query = useBuyerCheckInQuery();

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const { current, history } = query.data;
  const hasAnyData = Boolean(current) || history.length > 0;

  if (!hasAnyData) {
    return (
      <div className="flex flex-col gap-4 rounded-md bg-surface p-6 text-center">
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
        <Link href="/settings/qr" className="text-sm font-semibold text-brand hover:underline">
          {t('openQr')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {current ? (
        <section className="flex flex-col gap-3">
          <h3 className="text-base font-semibold text-ink">{t('current.title')}</h3>
          <Card
            className={cn(
              'flex flex-col gap-2 !p-5 shadow-none',
              current.checkedIn ? 'border-success/30 bg-success/5' : 'border-border bg-surface',
            )}
          >
            <p
              className={cn(
                'text-base font-semibold',
                current.checkedIn ? 'text-success' : 'text-ink',
              )}
            >
              {current.checkedIn ? t('current.checkedIn') : t('current.notCheckedIn')}
            </p>
            <p className="text-sm text-ink-secondary">{current.eventName}</p>
            {current.checkedIn && current.checkedInAt ? (
              <p className="text-sm text-ink-muted">
                {t('current.checkedInAt', {
                  time: formatBuyerDateTime(current.checkedInAt, locale),
                })}
              </p>
            ) : (
              <p className="text-sm text-ink-secondary">
                {t('current.showQrHint')}{' '}
                <Link href="/settings/qr" className="font-semibold text-brand hover:underline">
                  {t('openQr')}
                </Link>
              </p>
            )}
          </Card>
        </section>
      ) : (
        <p className="text-sm text-ink-secondary">{t('noActiveEvent')}</p>
      )}

      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-ink">{t('history.title')}</h3>
        <CheckInHistoryList items={history} />
      </section>
    </div>
  );
};
