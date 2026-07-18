"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { VenueMapSummary } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AdminBoothsSection } from "@/features/exhibition/components/admin/admin-booths-section";
import { EXHIBITION_PUBLICATION_STATUSES } from "@/features/exhibition/constants";
import {
  useAdminEventVenueMapsQuery,
  useCreateAdminVenueMapMutation,
  useDeleteAdminVenueMapMutation,
  useUpdateAdminVenueMapMutation,
} from "@/features/exhibition/hooks/use-exhibition";
import {
  venueMapFormSchema,
  type VenueMapFormInput,
  type VenueMapFormValues,
} from "@/features/exhibition/schemas/exhibition.schema";
import { PublicationStatusBadge } from "@/features/partners/components/partner-badges";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/ui/cn";

type AdminVenueMapsSectionProps = {
  eventId: string;
};

/**
 * Venue maps CRUD and nested booth management for an event.
 */
export const AdminVenueMapsSection = ({ eventId }: AdminVenueMapsSectionProps) => {
  const t = useTranslations("Admin.events.venueMaps");
  const mapsQuery = useAdminEventVenueMapsQuery(eventId);
  const createMutation = useCreateAdminVenueMapMutation(eventId);
  const updateMutation = useUpdateAdminVenueMapMutation(eventId);
  const deleteMutation = useDeleteAdminVenueMapMutation(eventId);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const maps = mapsQuery.data?.data ?? [];
  const selectedMap = maps.find((map) => map.id === selectedMapId) ?? maps[0] ?? null;

  const onCreate = async (values: VenueMapFormValues) => {
    const created = await createMutation.mutateAsync(toCreateBody(values));
    setShowCreate(false);
    setSelectedMapId(created.id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">{t("title")}</h2>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setShowCreate((open) => !open)}
        >
          {showCreate ? t("cancelCreate") : t("newMap")}
        </Button>
      </div>
      {showCreate ? (
        <VenueMapCreateForm onSubmit={onCreate} isBusy={createMutation.isPending} />
      ) : null}
      {mapsQuery.isLoading ? (
        <p className="text-sm text-ink-secondary">{t("loading")}</p>
      ) : maps.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {maps.map((map) => (
              <button
                key={map.id}
                type="button"
                className={cn(
                  "rounded-sm border px-3 py-2 text-sm",
                  selectedMap?.id === map.id
                    ? "border-brand bg-surface text-brand"
                    : "border-border text-ink-secondary hover:bg-surface",
                )}
                onClick={() => setSelectedMapId(map.id)}
              >
                {map.title}
              </button>
            ))}
          </div>
          {selectedMap ? (
            <>
              <VenueMapEditCard
                map={selectedMap}
                isBusy={updateMutation.isPending || deleteMutation.isPending}
                onSave={async (values) => {
                  await updateMutation.mutateAsync({
                    id: selectedMap.id,
                    body: toUpdateBody(values),
                  });
                }}
                onDelete={async () => {
                  await deleteMutation.mutateAsync(selectedMap.id);
                  setSelectedMapId(null);
                }}
              />
              <AdminBoothsSection map={selectedMap} />
            </>
          ) : null}
        </>
      )}
    </div>
  );
};

type VenueMapCreateFormProps = {
  onSubmit: (values: VenueMapFormValues) => Promise<void>;
  isBusy: boolean;
};

const VenueMapCreateForm = ({ onSubmit, isBusy }: VenueMapCreateFormProps) => {
  const t = useTranslations("Admin.events.venueMaps.form");
  const form = useForm<VenueMapFormInput, unknown, VenueMapFormValues>({
    resolver: zodResolver(venueMapFormSchema),
    defaultValues: {
      title: "",
      mediaAssetId: "",
      publicationStatus: "draft",
      width: "",
      height: "",
    },
  });

  return (
    <Card className="flex flex-col gap-3">
      <VenueMapFields form={form} />
      <Button
        type="button"
        variant="secondary"
        disabled={isBusy}
        onClick={form.handleSubmit(async (values) => onSubmit(values))}
      >
        {isBusy ? t("creating") : t("create")}
      </Button>
    </Card>
  );
};

type VenueMapEditCardProps = {
  map: VenueMapSummary;
  isBusy: boolean;
  onSave: (values: VenueMapFormValues) => Promise<void>;
  onDelete: () => Promise<void>;
};

const VenueMapEditCard = ({
  map,
  isBusy,
  onSave,
  onDelete,
}: VenueMapEditCardProps) => {
  const t = useTranslations("Admin.events.venueMaps.form");
  const form = useForm<VenueMapFormInput, unknown, VenueMapFormValues>({
    resolver: zodResolver(venueMapFormSchema),
    defaultValues: {
      title: map.title,
      mediaAssetId: map.mediaAssetId,
      publicationStatus: map.publicationStatus,
      width: map.width ?? "",
      height: map.height ?? "",
    },
  });

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <PublicationStatusBadge status={map.publicationStatus} />
      </div>
      <VenueMapFields form={form} />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={isBusy}
          onClick={form.handleSubmit(async (values) => onSave(values))}
        >
          {isBusy ? t("saving") : t("save")}
        </Button>
        <Button type="button" variant="ghost" disabled={isBusy} onClick={() => void onDelete()}>
          {t("delete")}
        </Button>
      </div>
    </Card>
  );
};

type VenueMapFieldsProps = {
  form: ReturnType<typeof useForm<VenueMapFormInput, unknown, VenueMapFormValues>>;
};

const VenueMapFields = ({ form }: VenueMapFieldsProps) => {
  const t = useTranslations("Admin.events.venueMaps.form");

  return (
    <>
      <FormField id="map-title" label={t("title")}>
        <Input id="map-title" {...form.register("title")} />
      </FormField>
      <FormField id="map-media" label={t("mediaAssetId")}>
        <Input id="map-media" {...form.register("mediaAssetId")} />
        <p className="text-xs text-ink-muted">{t("mediaHint")}</p>
      </FormField>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField id="map-width" label={t("width")}>
          <Input id="map-width" type="number" {...form.register("width")} />
        </FormField>
        <FormField id="map-height" label={t("height")}>
          <Input id="map-height" type="number" {...form.register("height")} />
        </FormField>
      </div>
      <FormField id="map-publication" label={t("publication")}>
        <select
          id="map-publication"
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
    </>
  );
};

const toCreateBody = (values: VenueMapFormValues) => ({
  title: values.title,
  mediaAssetId: values.mediaAssetId,
  publicationStatus: values.publicationStatus,
  ...(values.width ? { width: Number(values.width) } : {}),
  ...(values.height ? { height: Number(values.height) } : {}),
});

const toUpdateBody = (values: VenueMapFormValues) => ({
  title: values.title,
  mediaAssetId: values.mediaAssetId,
  publicationStatus: values.publicationStatus,
  width: values.width ? Number(values.width) : null,
  height: values.height ? Number(values.height) : null,
});
