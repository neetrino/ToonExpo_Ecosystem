"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import { AdminEventForm } from "@/features/exhibition/components/admin/admin-event-form";
import { useCreateAdminEventMutation } from "@/features/exhibition/hooks/use-exhibition";
import type { EventFormValues } from "@/features/exhibition/schemas/exhibition.schema";
import { Link } from "@/i18n/navigation";

/**
 * Admin create event page content.
 */
export const AdminNewEventPage = () => {
  const t = useTranslations("Admin.events");
  const router = useRouter();
  const mutation = useCreateAdminEventMutation();

  const onSubmit = async (values: EventFormValues) => {
    const event = await mutation.mutateAsync({
      name: values.name,
      code: values.code,
      status: values.status,
      publicationStatus: values.publicationStatus,
      ...(values.startDate ? { startDate: values.startDate } : {}),
      ...(values.endDate ? { endDate: values.endDate } : {}),
    });
    router.push(`/admin/events/${event.id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/events" className="text-sm text-ink-secondary hover:text-ink">
        {t("detail.back")}
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-ink">{t("new.title")}</h1>
        <p className="text-sm text-ink-secondary">{t("new.subtitle")}</p>
      </div>
      <AdminEventForm onSubmit={onSubmit} isBusy={mutation.isPending} />
    </div>
  );
};
