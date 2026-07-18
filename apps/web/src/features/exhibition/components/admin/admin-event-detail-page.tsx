"use client";

import { useTranslations } from "next-intl";

import { AdminCheckinSummaryPanel } from "@/features/exhibition/components/admin/admin-checkin-summary-panel";
import { AdminEventForm } from "@/features/exhibition/components/admin/admin-event-form";
import { AdminVenueMapsSection } from "@/features/exhibition/components/admin/admin-venue-maps-section";
import {
  useAdminEventCheckInSummaryQuery,
  useAdminEventQuery,
  useUpdateAdminEventMutation,
} from "@/features/exhibition/hooks/use-exhibition";
import type { EventFormValues } from "@/features/exhibition/schemas/exhibition.schema";
import { PublicationStatusBadge } from "@/features/partners/components/partner-badges";
import { Link } from "@/i18n/navigation";

type AdminEventDetailPageProps = {
  eventId: string;
};

/**
 * Admin event detail: edit form, check-in summary, venue maps.
 */
export const AdminEventDetailPage = ({ eventId }: AdminEventDetailPageProps) => {
  const t = useTranslations("Admin.events");
  const eventQuery = useAdminEventQuery(eventId);
  const summaryQuery = useAdminEventCheckInSummaryQuery(eventId);
  const updateMutation = useUpdateAdminEventMutation(eventId);

  if (eventQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (eventQuery.isError || !eventQuery.data) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-sm text-danger">
          {t("detail.notFound")}
        </p>
        <Link href="/admin/events" className="text-sm font-medium text-brand hover:underline">
          {t("detail.back")}
        </Link>
      </div>
    );
  }

  const event = eventQuery.data;

  const onSubmit = async (values: EventFormValues) => {
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <Link href="/admin/events" className="text-sm text-ink-secondary hover:text-ink">
          {t("detail.back")}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-ink">{event.name}</h1>
          <PublicationStatusBadge status={event.publicationStatus} />
        </div>
        <p className="text-sm text-ink-secondary">
          {t(`statuses.${event.status}`)} · {event.code}
        </p>
      </div>
      <AdminEventForm initial={event} onSubmit={onSubmit} isBusy={updateMutation.isPending} />
      {summaryQuery.data ? (
        <AdminCheckinSummaryPanel summary={summaryQuery.data} />
      ) : null}
      <AdminVenueMapsSection eventId={eventId} />
    </div>
  );
};
