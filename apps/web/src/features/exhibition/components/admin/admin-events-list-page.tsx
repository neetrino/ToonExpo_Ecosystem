"use client";

import { useTranslations } from "next-intl";

import { AdminEventsTable } from "@/features/exhibition/components/admin/admin-events-table";
import { useAdminEventsQuery } from "@/features/exhibition/hooks/use-exhibition";
import { Link } from "@/i18n/navigation";

/**
 * Admin exhibition events list page.
 */
export const AdminEventsListPage = () => {
  const t = useTranslations("Admin.events");
  const query = useAdminEventsQuery();

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (query.isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t("error")}
      </p>
    );
  }

  const events = query.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
          <p className="text-sm text-ink-secondary">
            {t("subtitle", { count: events.length })}
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex h-9 items-center justify-center rounded-pill bg-cta-dark px-4 text-sm font-medium text-on-dark hover:bg-cta-dark/90"
        >
          {t("newEvent")}
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
      ) : (
        <AdminEventsTable events={events} />
      )}
    </div>
  );
};
