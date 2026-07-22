'use client';

import type { BuyerCheckInStatusResponse } from '@toonexpo/contracts';
import { CalendarCheck, QrCode, ScanLine } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { AccountEmptyState } from '@/features/buyer/components/account/account-empty-state';
import { AccountStatusBadge } from '@/features/buyer/components/account/account-status-badge';
import { useBuyerCheckInQuery } from '@/features/buyer/hooks/use-buyer-checkin';
import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import { Link } from '@/i18n/navigation';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';
import { Reveal } from '@/shared/ui/motion/reveal';
import { Skeleton } from '@/shared/ui/skeleton';

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
      {items.map((item, index) => (
        <Reveal
          key={`${item.eventId}-${item.checkedInAt}`}
          delayMs={Math.min(index, 6) * 40}
          as="li"
        >
          <Card variant="elevated" padding="sm" className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand">
              <CalendarCheck className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{item.eventName}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {formatBuyerDateTime(item.checkedInAt, locale)}
              </p>
            </div>
          </Card>
        </Reveal>
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
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <p
        role="alert"
        className="rounded-md border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
      >
        {t('error')}
      </p>
    );
  }

  const { current, history } = query.data;
  const hasAnyData = Boolean(current) || history.length > 0;

  if (!hasAnyData) {
    return (
      <AccountEmptyState
        icon={ScanLine}
        title={t('emptyTitle')}
        description={t('empty')}
        action={
          <Link
            href="/qr"
            className={cn(
              'inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-brand-soft px-4',
              'text-sm font-medium text-brand transition-colors hover:bg-brand/15',
            )}
          >
            <QrCode className="size-4" aria-hidden />
            {t('openQr')}
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {current ? (
        <Reveal>
          <section className="flex flex-col gap-3" aria-labelledby="checkin-current-heading">
            <h2 id="checkin-current-heading" className="text-base font-semibold text-ink">
              {t('current.title')}
            </h2>
            <Card
              variant="elevated"
              className={cn(
                'flex flex-col gap-3',
                current.checkedIn ? 'border-success/25 bg-success/5' : undefined,
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <AccountStatusBadge
                  label={current.checkedIn ? t('current.checkedIn') : t('current.notCheckedIn')}
                  tone={current.checkedIn ? 'success' : 'warning'}
                />
              </div>
              <p className="text-sm font-medium text-ink">{current.eventName}</p>
              {current.checkedIn && current.checkedInAt ? (
                <p className="text-sm text-ink-muted">
                  {t('current.checkedInAt', {
                    time: formatBuyerDateTime(current.checkedInAt, locale),
                  })}
                </p>
              ) : (
                <p className="text-sm text-ink-secondary">
                  {t('current.showQrHint')}{' '}
                  <Link href="/qr" className="font-semibold text-brand hover:underline">
                    {t('openQr')}
                  </Link>
                </p>
              )}
            </Card>
          </section>
        </Reveal>
      ) : (
        <p className="text-sm text-ink-secondary">{t('noActiveEvent')}</p>
      )}

      <section className="flex flex-col gap-3" aria-labelledby="checkin-history-heading">
        <h2 id="checkin-history-heading" className="text-base font-semibold text-ink">
          {t('history.title')}
        </h2>
        <CheckInHistoryList items={history} />
      </section>
    </div>
  );
};
