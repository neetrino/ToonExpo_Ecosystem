'use client';

import type { BuyerFacingRequestStatus, BuyerRequestListItem } from '@toonexpo/contracts';
import {
  CalendarDays,
  Clock3,
  Layers,
  Quote,
  type LucideIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  AccountStatusBadge,
  getRequestStatusTone,
} from '@/features/buyer/components/account/account-status-badge';
import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import { cn } from '@/shared/ui/cn';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';

const CARD_RADIUS_CLASS = 'rounded-[24px]';
const ICON_WELL_CLASS =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-soft text-brand';

const statusKey = (status: BuyerFacingRequestStatus): `status.${BuyerFacingRequestStatus}` =>
  `status.${status}`;

type MetaRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

const MetaRow = ({ icon: Icon, label, value }: MetaRowProps) => (
  <div className="flex items-center gap-3">
    <span className={ICON_WELL_CLASS}>
      <Icon className="size-4" strokeWidth={2} aria-hidden />
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-bold tracking-widest text-ink-muted uppercase">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value}</p>
    </div>
  </div>
);

const NoteDotPattern = () => (
  <svg
    className="pointer-events-none absolute right-2 bottom-2 size-14 text-brand/30"
    viewBox="0 0 56 56"
    aria-hidden
  >
    {Array.from({ length: 36 }, (_, index) => {
      const col = index % 6;
      const row = Math.floor(index / 6);
      return (
        <circle
          key={index}
          cx={4 + col * 9}
          cy={4 + row * 9}
          r="1.5"
          fill="currentColor"
        />
      );
    })}
  </svg>
);

const CardWave = () => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 overflow-hidden" aria-hidden>
    <svg
      viewBox="0 0 360 80"
      className="absolute inset-x-0 bottom-0 h-full w-full text-brand-soft"
      preserveAspectRatio="none"
    >
      <path
        d="M0 48 C60 28 120 68 180 48 C240 28 300 58 360 40 L360 80 L0 80 Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M0 58 C70 40 140 72 210 54 C280 36 320 62 360 50 L360 80 L0 80 Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  </div>
);

type BuyerRequestCardProps = {
  item: BuyerRequestListItem;
};

/**
 * Buyer request card — teal account chrome matching the requests mock.
 */
export const BuyerRequestCard = ({ item }: BuyerRequestCardProps) => {
  const t = useTranslations('Profile.requests');
  const locale = useLocale();
  const title = item.projectName ?? item.builderCompanyName;
  const showNoteBlock = Boolean(item.note) || Boolean(item.apartmentId);

  return (
    <article
      className={cn(
        'relative flex h-full flex-col overflow-hidden border border-border/70 bg-surface-elevated',
        'p-5 pb-12 shadow-card sm:p-6 sm:pb-12',
        CARD_RADIUS_CLASS,
        LIST_CARD_LIFT_CLASS,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={ICON_WELL_CLASS}>
          <Layers className="size-4" strokeWidth={2} aria-hidden />
        </span>
        <AccountStatusBadge
          label={t(statusKey(item.buyerStatus))}
          tone={getRequestStatusTone(item.buyerStatus)}
        />
      </div>

      <div className="mt-4 min-w-0">
        <h2 className="truncate text-xl font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mt-1 truncate text-sm text-ink-secondary">{item.builderCompanyName}</p>
      </div>

      <div className="mt-5 flex flex-col gap-3.5 border-y border-border/70 py-4">
        <MetaRow
          icon={CalendarDays}
          label={t('createdLabel')}
          value={formatBuyerDateTime(item.createdAt, locale)}
        />
        <MetaRow
          icon={Clock3}
          label={t('updatedLabel')}
          value={formatBuyerDateTime(item.updatedAt, locale)}
        />
      </div>

      {showNoteBlock ? (
        <div className="relative mt-5 overflow-hidden rounded-[16px] bg-canvas/80 px-4 py-3.5">
          <Quote className="size-5 text-brand" strokeWidth={2} aria-hidden />
          {item.note ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink">{item.note}</p>
          ) : (
            <p className="mt-2 text-sm text-ink-secondary">{t('apartmentLinked')}</p>
          )}
          <NoteDotPattern />
        </div>
      ) : null}

      <CardWave />
    </article>
  );
};
