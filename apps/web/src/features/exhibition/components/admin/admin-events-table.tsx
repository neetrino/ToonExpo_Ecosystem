'use client';

import type { EventStatus, EventSummary } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Link } from '@/i18n/navigation';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { cn } from '@/shared/ui/cn';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type AdminEventsTableProps = {
  events: EventSummary[];
  viewMode?: ViewMode | undefined;
};

const EVENT_STATUS_CLASS: Record<EventStatus, string> = {
  planning: 'bg-surface text-ink-muted',
  active: 'bg-success/10 text-success',
  completed: 'bg-brand/10 text-brand',
  archived: 'bg-warning/10 text-warning',
  cancelled: 'bg-danger-soft text-danger',
};

/**
 * Admin events collection as table or card grid.
 */
export const AdminEventsTable = ({ events, viewMode = VIEW_MODE_CARDS }: AdminEventsTableProps) => {
  const t = useTranslations('Admin.events');

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid>
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/admin/events/${event.id}`}
            className="flex flex-col gap-2 rounded-sm border border-border bg-background p-3 transition-colors hover:bg-surface/60"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0 truncate font-medium text-ink">{event.name}</span>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={cn(
                    'inline-flex w-fit rounded-pill px-2.5 py-0.5 text-xs font-medium',
                    EVENT_STATUS_CLASS[event.status],
                  )}
                >
                  {t(`statuses.${event.status}`)}
                </span>
                <PublicationStatusBadge status={event.publicationStatus} />
              </div>
            </div>
            <span className="font-mono text-xs text-ink-muted">{event.code}</span>
          </Link>
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-xs uppercase text-ink-muted">
            <th className="px-4 py-3">{t('columns.name')}</th>
            <th className="px-4 py-3">{t('columns.code')}</th>
            <th className="px-4 py-3">{t('columns.status')}</th>
            <th className="px-4 py-3">{t('columns.publication')}</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/events/${event.id}`}
                  className="font-medium text-brand hover:underline"
                >
                  {event.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink-secondary">{event.code}</td>
              <td className="px-4 py-3">{t(`statuses.${event.status}`)}</td>
              <td className="px-4 py-3">
                <PublicationStatusBadge status={event.publicationStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
