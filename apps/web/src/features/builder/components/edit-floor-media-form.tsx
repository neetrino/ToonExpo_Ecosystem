"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { PortalFloorSummary } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useUpdateFloorMutation } from "@/features/builder/hooks/use-portal-inventory";
import {
  updateFloorSchema,
  type UpdateFloorFormValues,
} from "@/features/builder/schemas/inventory.schema";
import { MediaUploadField } from "@/features/media/components/media-upload-field";
import { toNullableMediaId } from "@/features/media/schemas/media-fields.schema";
import { Button } from "@/shared/ui/button";

type EditFloorMediaFormProps = {
  projectId: string;
  floor: PortalFloorSummary;
};

/**
 * Inline form to set or replace a floor plan image.
 */
export const EditFloorMediaForm = ({
  projectId,
  floor,
}: EditFloorMediaFormProps) => {
  const t = useTranslations("Builder.inventory");
  const mutation = useUpdateFloorMutation(projectId, floor.id);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<UpdateFloorFormValues>({
    resolver: zodResolver(updateFloorSchema),
    defaultValues: { floorplanMediaId: floor.floorplanMediaId ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setSuccess(false);
    try {
      await mutation.mutateAsync({
        floorplanMediaId: toNullableMediaId(values.floorplanMediaId),
      });
      setSuccess(true);
    } catch {
      setError(t("errors.generic"));
    }
  });

  const busy = isSubmitting || mutation.isPending;

  return (
    <form onSubmit={onSubmit} className="mt-2 flex flex-col gap-2" noValidate>
      <Controller
        control={control}
        name="floorplanMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id={`floor-plan-${floor.id}`}
            label={t("floorplanMedia")}
            context="portal"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="text-xs text-success">
          {t("floorplanSaved")}
        </p>
      ) : null}
      <Button type="submit" size="sm" variant="ghost" disabled={busy || !isDirty}>
        {busy ? t("adding") : t("saveFloorplan")}
      </Button>
    </form>
  );
};
