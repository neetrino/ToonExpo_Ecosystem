"use client";

import type {
  PortalProjectDetail,
  PortalVisualHotspotItem,
  VisualHotspotTargetType,
  VisualMapContextType,
} from "@toonexpo/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { usePortalFloorApartmentsQuery } from "@/features/builder/hooks/use-portal-inventory";
import { VISUAL_MAP_PUBLICATION_STATUSES } from "@/features/visual-map/constants";
import {
  visualHotspotFormSchema,
  type VisualHotspotFormInput,
  type VisualHotspotFormValues,
} from "@/features/visual-map/schemas/visual-map.schema";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type PortalHotspotFormProps = {
  project: PortalProjectDetail;
  contextType: VisualMapContextType;
  contextId: string;
  initial?: PortalVisualHotspotItem | undefined;
  pickedCoordinates?: { xPercent: number; yPercent: number } | null;
  isBusy: boolean;
  onSubmit: (values: VisualHotspotFormValues) => Promise<void>;
  onDelete?: (() => Promise<void>) | undefined;
};

/**
 * Create/edit hotspot form with target constraints and coordinate fine-tune.
 */
export const PortalHotspotForm = ({
  project,
  contextType,
  contextId,
  initial,
  pickedCoordinates,
  isBusy,
  onSubmit,
  onDelete,
}: PortalHotspotFormProps) => {
  const t = useTranslations("Builder.visualMap.editor.hotspotForm");
  const isEdit = initial != null;
  const defaultTargetType = targetTypeForContext(contextType);

  const form = useForm<VisualHotspotFormInput, unknown, VisualHotspotFormValues>({
    resolver: zodResolver(visualHotspotFormSchema),
    defaultValues: initial
      ? {
          targetType: initial.targetType,
          targetId: initial.targetId,
          label: initial.label,
          xPercent: Number(initial.xPercent),
          yPercent: Number(initial.yPercent),
          markerStyle: initial.markerStyle ?? "",
          publicationStatus: initial.publicationStatus,
        }
      : {
          targetType: defaultTargetType,
          targetId: "",
          label: "",
          xPercent: 50,
          yPercent: 50,
          markerStyle: "",
          publicationStatus: "draft",
        },
  });

  const targetId = form.watch("targetId");
  const floorId = contextType === "floor" ? contextId : null;
  const apartmentsQuery = usePortalFloorApartmentsQuery(floorId ?? "");

  const targetOptions = useMemo(
    () =>
      buildTargetOptions(
        project,
        contextType,
        contextId,
        targetTypeForContext(contextType),
        apartmentsQuery.data ?? [],
      ),
    [project, contextType, contextId, apartmentsQuery.data],
  );

  useEffect(() => {
    if (!pickedCoordinates) {
      return;
    }
    form.setValue("xPercent", pickedCoordinates.xPercent);
    form.setValue("yPercent", pickedCoordinates.yPercent);
  }, [pickedCoordinates, form]);

  useEffect(() => {
    if (isEdit) {
      return;
    }
    const match = targetOptions.find((option) => option.value === targetId);
    if (match && !form.getValues("label")) {
      form.setValue("label", match.label);
    }
  }, [targetId, targetOptions, form, isEdit]);

  const targetStatus = initial?.targetStatus;
  const showTargetWarning = targetStatus != null && targetStatus !== "ok";

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit({
          ...values,
          targetType: targetTypeForContext(contextType),
        });
      })}
      noValidate
    >
      {showTargetWarning ? (
        <div
          role="alert"
          className="rounded-sm border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-ink"
        >
          <p className="font-medium">{t(`targetStatus.${targetStatus}`)}</p>
          <p className="mt-1 text-ink-secondary">{t("targetStatusHint")}</p>
        </div>
      ) : null}

      <FormField id="hotspot-target" label={t("target")}>
        <select
          id="hotspot-target"
          className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm"
          {...form.register("targetId", {
            onChange: (event) => {
              const nextId = event.target.value;
              const option = targetOptions.find((item) => item.value === nextId);
              if (option) {
                form.setValue("label", option.label);
              }
            },
          })}
        >
          <option value="">{t("selectTarget")}</option>
          {targetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="hotspot-label" label={t("label")}>
        <Input id="hotspot-label" {...form.register("label")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField id="hotspot-x" label={t("xPercent")}>
          <Input
            id="hotspot-x"
            type="number"
            step="0.01"
            {...form.register("xPercent")}
          />
        </FormField>
        <FormField id="hotspot-y" label={t("yPercent")}>
          <Input
            id="hotspot-y"
            type="number"
            step="0.01"
            {...form.register("yPercent")}
          />
        </FormField>
      </div>

      <FormField id="hotspot-style" label={t("markerStyle")}>
        <Input id="hotspot-style" {...form.register("markerStyle")} />
      </FormField>

      <FormField id="hotspot-publication" label={t("publication")}>
        <select
          id="hotspot-publication"
          className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm"
          {...form.register("publicationStatus")}
        >
          {VISUAL_MAP_PUBLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`publicationStatuses.${status}`)}
            </option>
          ))}
        </select>
      </FormField>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="secondary" disabled={isBusy}>
          {isBusy ? t("saving") : isEdit ? t("save") : t("create")}
        </Button>
        {onDelete ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isBusy}
            onClick={() => {
              void onDelete();
            }}
          >
            {t("delete")}
          </Button>
        ) : null}
      </div>
    </form>
  );
};

const targetTypeForContext = (
  contextType: VisualMapContextType,
): VisualHotspotTargetType => {
  if (contextType === "project") {
    return "building";
  }
  if (contextType === "building") {
    return "floor";
  }
  return "apartment";
};

type TargetOption = { value: string; label: string };

const buildTargetOptions = (
  project: PortalProjectDetail,
  contextType: VisualMapContextType,
  contextId: string,
  targetType: VisualHotspotTargetType,
  apartments: { id: string; number: string }[],
): TargetOption[] => {
  if (targetType === "building") {
    return project.buildings.map((building) => ({
      value: building.id,
      label: building.name,
    }));
  }

  if (targetType === "floor") {
    const building =
      contextType === "building"
        ? project.buildings.find((item) => item.id === contextId)
        : project.buildings.find((item) =>
            item.floors.some((floor) => floor.id === contextId),
          );

    return (building?.floors ?? []).map((floor) => ({
      value: floor.id,
      label: floor.displayLabel ?? String(floor.number),
    }));
  }

  return apartments.map((apartment) => ({
    value: apartment.id,
    label: apartment.number,
  }));
};
