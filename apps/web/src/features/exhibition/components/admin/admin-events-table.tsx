'use client';

import type { EventSummary } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { AdminEventCard } from '@/features/exhibition/components/admin/admin-event-card';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { ListTableReveal } from '@/shared/ui/motion';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type AdminEventsTableProps = {
  events: EventSummary[];
  onSelectEvent: (eventId: string) => void;
  viewMode?: ViewMode | undefined;
};

/**
 * Admin events collection as table or card grid.
 */
export const AdminEventsTable = ({
  events,
  onSelectEvent,
  viewMode = VIEW_MODE_CARDS,
}: AdminEventsTableProps) => {
  const t = useTranslations('Admin.events');

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.map((event) => (
          <AdminEventCard
            key={event.id}
            event={event}
            onSelect={() => {
              onSelectEvent(event.id);
            }}
          />
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <ListTableReveal>
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
                  <button
                    type="button"
                    className="font-medium text-brand hover:underline"
                    onClick={() => {
                      onSelectEvent(event.id);
                    }}
                  >
                    {event.name}
                  </button>
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
    </ListTableReveal>
  );
};
