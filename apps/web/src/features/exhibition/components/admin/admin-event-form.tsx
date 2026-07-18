"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { EventSummary } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import {
  EXHIBITION_EVENT_STATUSES,
  EXHIBITION_PUBLICATION_STATUSES,
} from "@/features/exhibition/constants";
import {
  eventFormSchema,
  type EventFormInput,
  type EventFormValues,
} from "@/features/exhibition/schemas/exhibition.schema";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type AdminEventFormProps = {
  initial?: EventSummary | undefined;
  onSubmit: (values: EventFormValues) => Promise<void>;
  isBusy: boolean;
};

/**
 * Create/edit form for exhibition events.
 */
export const AdminEventForm = ({
  initial,
  onSubmit,
  isBusy,
}: AdminEventFormProps) => {
  const t = useTranslations("Admin.events.form");
  const isEdit = initial != null;

  const form = useForm<EventFormInput, unknown, EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          code: initial.code,
          startDate: initial.startDate ?? "",
          endDate: initial.endDate ?? "",
          status: initial.status,
          publicationStatus: initial.publicationStatus,
        }
      : {
          name: "",
          code: "",
          startDate: "",
          endDate: "",
          status: "planning",
          publicationStatus: "draft",
        },
  });

  return (
    <form
      className="flex max-w-xl flex-col gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      noValidate
    >
      <FormField id="event-name" label={t("name")}>
        <Input id="event-name" {...form.register("name")} />
      </FormField>
      <FormField id="event-code" label={t("code")}>
        <Input id="event-code" {...form.register("code")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="event-start" label={t("startDate")}>
          <Input id="event-start" type="date" {...form.register("startDate")} />
        </FormField>
        <FormField id="event-end" label={t("endDate")}>
          <Input id="event-end" type="date" {...form.register("endDate")} />
        </FormField>
      </div>
      <FormField id="event-status" label={t("status")}>
        <select
          id="event-status"
          className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm"
          {...form.register("status")}
        >
          {EXHIBITION_EVENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`statuses.${status}`)}
            </option>
          ))}
        </select>
      </FormField>
      <FormField id="event-publication" label={t("publication")}>
        <select
          id="event-publication"
          className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm"
          {...form.register("publicationStatus")}
        >
          {EXHIBITION_PUBLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`publicationStatuses.${status}`)}
            </option>
          ))}
        </select>
      </FormField>
      <Button type="submit" variant="secondary" disabled={isBusy}>
        {isBusy ? t("saving") : isEdit ? t("save") : t("create")}
      </Button>
    </form>
  );
};
