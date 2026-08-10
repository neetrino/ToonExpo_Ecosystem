'use client';

import type {
  BuyerCheckInCurrentStatus,
  BuyerCheckInHistoryItem,
  BuyerCheckInStatusResponse,
} from '@toonexpo/contracts';
import {
  CalendarDays,
  Check,
  Info,
  ScanLine,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { BUYER_CHECKIN_PREVIEW } from '@/features/buyer/constants/buyer-checkin-preview';
import { useBuyerCheckInQuery } from '@/features/buyer/hooks/use-buyer-checkin';
import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import { cn } from '@/shared/ui/cn';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';
import { Reveal } from '@/shared/ui/motion/reveal';
import { Skeleton } from '@/shared/ui/skeleton';

const CARD_RADIUS_CLASS = 'rounded-[20px]';

type PreviewBannerProps = {
  title: string;
  hint: string;
};

const PreviewBanner = ({ title, hint }: PreviewBannerProps) => (
  <div
    role="status"
    className={cn(
      'flex items-start gap-3 border border-brand/20 bg-brand-soft/50 px-4 py-3.5',
      CARD_RADIUS_CLASS,
    )}
  >
    <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-brand">
      <Info className="size-4" strokeWidth={2.25} aria-hidden />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-brand">{title}</p>
      <p className="mt-0.5 text-sm leading-relaxed text-ink-secondary">{hint}</p>
    </div>
  </div>
);

type CurrentExhibitionCardProps = {
  current: BuyerCheckInCurrentStatus;
};

const CurrentExhibitionCard = ({ current }: CurrentExhibitionCardProps) => {
  const t = useTranslations('Profile.checkin');
  const locale = useLocale();

  return (
    <article
      className={cn(
        'flex gap-3 border border-brand/20 bg-brand-soft/30 p-4 shadow-card',
        CARD_RADIUS_CLASS,
        LIST_CARD_LIFT_CLASS,
      )}
    >
      <span
        className={cn(
          'inline-flex size-11 shrink-0 items-center justify-center rounded-full',
          current.checkedIn
            ? 'bg-success text-on-dark ring-4 ring-success/20'
            : 'bg-warning/15 text-warning ring-1 ring-warning/30',
        )}
      >
        {current.checkedIn ? (
          <Check className="size-5" strokeWidth={2.5} aria-hidden />
        ) : (
          <ScanLine className="size-5" strokeWidth={2} aria-hidden />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-pill px-2 py-0.5',
            'text-[10px] font-bold tracking-wide uppercase',
            current.checkedIn
              ? 'bg-success/15 text-success'
              : 'bg-warning/15 text-warning',
          )}
        >
          {current.checkedIn ? (
            <>
              <Check className="size-3" strokeWidth={2.5} aria-hidden />
              {t('current.checkedIn')}
            </>
          ) : (
            t('current.notCheckedIn')
          )}
        </span>

        <h3 className="mt-2 truncate text-base font-semibold tracking-tight text-ink">
          {current.eventName}
        </h3>

        {current.checkedIn && current.checkedInAt ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-secondary">
            <CalendarDays className="size-3.5 shrink-0 text-brand" aria-hidden />
            <span className="truncate">
              {t('current.checkedInAt', {
                time: formatBuyerDateTime(current.checkedInAt, locale),
              })}
            </span>
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-ink-secondary">{t('current.showQrHint')}</p>
        )}
      </div>
    </article>
  );
};

type HistoryListProps = {
  items: BuyerCheckInHistoryItem[];
};

const HistoryList = ({ items }: HistoryListProps) => {
  const t = useTranslations('Profile.checkin');
  const locale = useLocale();

  if (items.length === 0) {
    return <p className="text-sm text-ink-secondary">{t('history.empty')}</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <Reveal
          key={`${item.eventId}-${item.checkedInAt}`}
          force
          delayMs={Math.min(index, 6) * 40}
          as="li"
          className="min-w-0"
        >
          <div
            className={cn(
              'flex h-full items-center gap-3 border border-border/70 bg-surface-elevated px-4 py-3.5',
              CARD_RADIUS_CLASS,
              LIST_CARD_LIFT_CLASS,
            )}
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-soft text-brand">
              <CalendarDays className="size-4" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{item.eventName}</p>
              <p className="mt-0.5 truncate text-xs text-ink-muted">
                {formatBuyerDateTime(item.checkedInAt, locale)}
              </p>
            </div>
          </div>
        </Reveal>
      ))}
    </ul>
  );
};

type CheckInContentProps = {
  data: BuyerCheckInStatusResponse;
};

const CheckInContent = ({ data }: CheckInContentProps) => {
  const t = useTranslations('Profile.checkin');

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3" aria-labelledby="checkin-current-heading">
        <h2 id="checkin-current-heading" className="text-base font-semibold text-ink">
          {t('current.title')}
        </h2>
        {data.current ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <CurrentExhibitionCard current={data.current} />
          </div>
        ) : (
          <p className="text-sm text-ink-secondary">{t('noActiveEvent')}</p>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="checkin-history-heading">
        <h2 id="checkin-history-heading" className="text-base font-semibold text-ink">
          {t('history.title')}
        </h2>
        <HistoryList items={data.history} />
      </section>
    </div>
  );
};

/**
 * Buyer check-in status — styled like the account check-in mock.
 * Shows labeled preview sample when there is no real check-in yet.
 */
export const BuyerCheckInStatus = () => {
  const t = useTranslations('Profile.checkin');
  const query = useBuyerCheckInQuery();

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
        <Skeleton className="h-16 w-full rounded-[20px]" />
        <Skeleton className="h-40 w-full rounded-[20px]" />
        <Skeleton className="h-24 w-full rounded-[20px]" />
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

  const hasRealCheckIn =
    Boolean(query.data.current?.checkedIn) || query.data.history.length > 0;
  const isPreview = !hasRealCheckIn;
  const displayData = isPreview ? BUYER_CHECKIN_PREVIEW : query.data;

  return (
    <div className="flex flex-col gap-6">
      {isPreview ? (
        <PreviewBanner title={t('previewBadge')} hint={t('previewHint')} />
      ) : null}

      <CheckInContent data={displayData} />
    </div>
  );
};
