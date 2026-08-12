'use client';

import { useTranslations } from 'next-intl';

import { AdminCheckinSummaryPanel } from '@/features/exhibition/components/admin/admin-checkin-summary-panel';
import { AdminEventForm } from '@/features/exhibition/components/admin/admin-event-form';
import { AdminVenueMapsSection } from '@/features/exhibition/components/admin/admin-venue-maps-section';
import {
  useAdminEventCheckInSummaryQuery,
  useAdminEventQuery,
  useUpdateAdminEventMutation,
} from '@/features/exhibition/hooks/use-exhibition';
import type { EventFormValues } from '@/features/exhibition/schemas/exhibition.schema';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';

type AdminEventDetailSheetProps = {
  eventId: string | null;
  open: boolean;
  onClose: () => void;
};

/**
 * Right-side sheet with event edit form, check-in summary, and venue maps.
 */
export const AdminEventDetailSheet = ({ eventId, open, onClose }: AdminEventDetailSheetProps) => {
  const t = useTranslations('Admin.events');
  const eventQuery = useAdminEventQuery(eventId ?? '');
  const summaryQuery = useAdminEventCheckInSummaryQuery(eventId ?? '');
  const updateMutation = useUpdateAdminEventMutation(eventId ?? '');

  const event = eventQuery.data;
  const title = event?.name ?? t('detail.sheetTitle');

  const onSubmit = async (values: EventFormValues): Promise<void> => {
    if (!eventId) {
      return;
    }
    await updateMutation.mutateAsync({
      name: values.name,
      code: values.code,
      status: values.status,
      publicationStatus: values.publicationStatus,
      startDate: values.startDate || null,
      endDate: values.endDate || null,
    });
  };

  return (
    <AdminCreateSheet
      open={open}
      onClose={onClose}
      title={title}
      description={
        event ? `${t(`statuses.${event.status}`)} · ${event.code}` : undefined
      }
      headerActions={
        event ? <PublicationStatusBadge status={event.publicationStatus} /> : undefined
      }
      size="default"
    >
      {!eventId || eventQuery.isLoading ? (
        <p className="text-sm text-ink-secondary">{t('loading')}</p>
      ) : null}

      {eventId && (eventQuery.isError || (!eventQuery.isLoading && !event)) ? (
        <p role="alert" className="text-sm text-danger">
          {t('detail.notFound')}
        </p>
      ) : null}

      {event && eventId ? (
        <div className="flex flex-col gap-8">
          <AdminEventForm
            key={event.id}
            initial={event}
            onSubmit={onSubmit}
            isBusy={updateMutation.isPending}
          />
          {summaryQuery.data ? <AdminCheckinSummaryPanel summary={summaryQuery.data} /> : null}
          <AdminVenueMapsSection eventId={eventId} />
        </div>
      ) : null}
    </AdminCreateSheet>
  );
};
