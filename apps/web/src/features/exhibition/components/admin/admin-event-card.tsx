'use client';

import type { EventStatus, EventSummary } from '@toonexpo/contracts';
import type { LucideIcon } from 'lucide-react';
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Radio,
  XCircle,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatEventDateRange } from '@/features/exhibition/utils/format-event-dates';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { cn } from '@/shared/ui/cn';
import { LIST_STATUS_BADGE_CLASS } from '@/shared/ui/list-status-badge';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';

const CARD_RADIUS_CLASS = 'rounded-[15px]';
const MEDIA_RADIUS_CLASS = 'rounded-[14px]';
const MEDIA_ASPECT_CLASS = 'aspect-[16/10]';

type AdminEventCardProps = {
  event: EventSummary;
  onSelect: () => void;
};

const EVENT_STATUS_BADGE_CLASS: Record<EventStatus, string> = {
  planning: 'bg-surface text-ink-muted',
  active: 'bg-success/10 text-success',
  completed: 'bg-brand/10 text-brand',
  archived: 'bg-warning/10 text-warning',
  cancelled: 'bg-danger-soft text-danger',
};

const EVENT_STATUS_MEDIA_CLASS: Record<EventStatus, string> = {
  planning: 'from-surface to-surface-elevated text-ink-muted',
  active: 'from-success/15 to-success/5 text-success',
  completed: 'from-brand/15 to-brand/5 text-brand',
  archived: 'from-warning/15 to-warning/5 text-warning',
  cancelled: 'from-danger-soft to-surface text-danger',
};

const EVENT_STATUS_ICON: Record<EventStatus, LucideIcon> = {
  planning: CircleDashed,
  active: Radio,
  completed: CheckCircle2,
  archived: Archive,
  cancelled: XCircle,
};

/**
 * Exhibition event collection card — same chrome as companies/partners.
 */
export const AdminEventCard = ({ event, onSelect }: AdminEventCardProps) => {
  const t = useTranslations('Admin.events');
  const locale = useLocale();
  const StatusIcon = EVENT_STATUS_ICON[event.status];
  const dateRange = formatEventDateRange(event.startDate, event.endDate, locale);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group flex h-full w-full flex-col gap-3 overflow-hidden border border-border/80',
        'bg-surface-elevated p-3.5 text-left shadow-card',
        LIST_CARD_LIFT_CLASS,
        CARD_RADIUS_CLASS,
      )}
    >
      <header className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand ring-1 ring-border"
              aria-hidden
            >
              <CalendarDays className="size-4" strokeWidth={2} />
            </span>
            <p className="min-w-0 truncate font-mono text-sm font-medium text-ink-secondary">
              {event.code}
            </p>
          </div>
          <span
            className={cn(
              LIST_STATUS_BADGE_CLASS,
              'shrink-0 items-center gap-1',
              EVENT_STATUS_BADGE_CLASS[event.status],
            )}
          >
            <StatusIcon className="size-3.5" aria-hidden />
            {t(`statuses.${event.status}`)}
          </span>
        </div>
        <h2
          className={cn(
            'truncate text-base font-semibold tracking-tight text-ink',
            'transition-colors duration-[var(--duration-fast)] group-hover:text-brand-deep',
          )}
        >
          {event.name}
        </h2>
      </header>

      <div
        className={cn(
          'relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden',
          'bg-gradient-to-br ring-1 ring-border/60',
          MEDIA_ASPECT_CLASS,
          MEDIA_RADIUS_CLASS,
          EVENT_STATUS_MEDIA_CLASS[event.status],
        )}
      >
        <CalendarDays
          className="size-10 opacity-40 transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-premium)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          strokeWidth={1.5}
          aria-hidden
        />
        <span className="max-w-[80%] truncate text-center text-xs font-medium opacity-70">
          {event.name}
        </span>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
        <PublicationStatusBadge status={event.publicationStatus} />
        <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-ink-muted">
          <CalendarDays className="size-3.5 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{dateRange ?? t('card.noDates')}</span>
        </span>
      </div>
    </button>
  );
};
