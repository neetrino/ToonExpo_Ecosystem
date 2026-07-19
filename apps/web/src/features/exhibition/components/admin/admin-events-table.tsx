"use client";

import type { EventSummary } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { PublicationStatusBadge } from "@/features/partners/components/partner-badges";

type AdminEventsTableProps = {
  events: EventSummary[];
};

/**
 * Admin events list table.
 */
export const AdminEventsTable = ({ events }: AdminEventsTableProps) => {
  const t = useTranslations("Admin.events");

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-xs uppercase text-ink-muted">
            <th className="px-4 py-3">{t("columns.name")}</th>
            <th className="px-4 py-3">{t("columns.code")}</th>
            <th className="px-4 py-3">{t("columns.status")}</th>
            <th className="px-4 py-3">{t("columns.publication")}</th>
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
