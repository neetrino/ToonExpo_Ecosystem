"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { PortalBuildingSummary } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useUpdateBuildingMutation } from "@/features/builder/hooks/use-portal-inventory";
import {
  updateBuildingSchema,
  type UpdateBuildingFormValues,
} from "@/features/builder/schemas/inventory.schema";
import { MediaUploadField } from "@/features/media/components/media-upload-field";
import { toNullableMediaId } from "@/features/media/schemas/media-fields.schema";
import { Button } from "@/shared/ui/button";

type EditBuildingMediaFormProps = {
  projectId: string;
  building: PortalBuildingSummary;
};

/**
 * Inline form to set or replace a building cover image.
 */
export const EditBuildingMediaForm = ({
  projectId,
  building,
}: EditBuildingMediaFormProps) => {
  const t = useTranslations("Builder.inventory");
  const mutation = useUpdateBuildingMutation(projectId, building.id);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<UpdateBuildingFormValues>({
    resolver: zodResolver(updateBuildingSchema),
    defaultValues: { coverMediaId: building.coverMediaId ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setSuccess(false);
    try {
      await mutation.mutateAsync({
        coverMediaId: toNullableMediaId(values.coverMediaId),
      });
      setSuccess(true);
    } catch {
      setError(t("errors.generic"));
    }
  });

  const busy = isSubmitting || mutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2" noValidate>
      <Controller
        control={control}
        name="coverMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id={`building-cover-${building.id}`}
            label={t("coverMedia")}
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
          {t("coverSaved")}
        </p>
      ) : null}
      <Button type="submit" size="sm" variant="ghost" disabled={busy || !isDirty}>
        {busy ? t("adding") : t("saveCover")}
      </Button>
    </form>
  );
};
