'use client';

import type { EventSummary } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Link } from '@/i18n/navigation';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type AdminEventsTableProps = {
  events: EventSummary[];
  viewMode?: ViewMode | undefined;
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
            <span className="font-medium text-ink">{event.name}</span>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              <span className="font-mono">{event.code}</span>
              <span aria-hidden>·</span>
              <span>{t(`statuses.${event.status}`)}</span>
            </div>
            <PublicationStatusBadge status={event.publicationStatus} />
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
