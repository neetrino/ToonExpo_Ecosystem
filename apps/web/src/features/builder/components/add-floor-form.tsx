"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useCreateFloorMutation } from "@/features/builder/hooks/use-portal-inventory";
import {
  createFloorSchema,
  type CreateFloorFormValues,
} from "@/features/builder/schemas/inventory.schema";
import { MediaUploadField } from "@/features/media/components/media-upload-field";
import { toOptionalMediaId } from "@/features/media/schemas/media-fields.schema";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type AddFloorFormProps = {
  projectId: string;
  buildingId: string;
};

/**
 * Inline form to add a floor to a building.
 */
export const AddFloorForm = ({
  projectId,
  buildingId,
}: AddFloorFormProps) => {
  const t = useTranslations("Builder.inventory");
  const mutation = useCreateFloorMutation(projectId, buildingId);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFloorFormValues>({
    resolver: zodResolver(createFloorSchema),
    defaultValues: {
      floorNumber: "1",
      name: "",
      displayLabel: "",
      floorplanMediaId: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const floorNumber = Number(values.floorNumber);
      await mutation.mutateAsync({
        floorNumber,
        ...(values.name.length > 0 ? { name: values.name } : {}),
        ...(values.displayLabel.length > 0
          ? { displayLabel: values.displayLabel }
          : {}),
        ...(toOptionalMediaId(values.floorplanMediaId)
          ? { floorplanMediaId: values.floorplanMediaId }
          : {}),
      });
      reset({
        floorNumber: String(floorNumber + 1),
        name: "",
        displayLabel: "",
        floorplanMediaId: "",
      });
    } catch {
      setError(t("errors.generic"));
    }
  });

  const busy = isSubmitting || mutation.isPending;

  return (
    <form
      onSubmit={onSubmit}
      className="mt-2 flex flex-col gap-2 rounded-sm bg-background p-2"
      noValidate
    >
      <p className="text-xs font-medium text-ink-secondary">{t("addFloor")}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <FormField
          id={`floor-number-${buildingId}`}
          label={t("floorNumber")}
          error={errors.floorNumber ? t("validation.floorNumber") : undefined}
        >
          <Input
            id={`floor-number-${buildingId}`}
            type="number"
            {...register("floorNumber")}
          />
        </FormField>
        <FormField id={`floor-name-${buildingId}`} label={t("floorName")}>
          <Input id={`floor-name-${buildingId}`} {...register("name")} />
        </FormField>
        <FormField id={`floor-label-${buildingId}`} label={t("displayLabel")}>
          <Input
            id={`floor-label-${buildingId}`}
            {...register("displayLabel")}
          />
        </FormField>
      </div>
      <Controller
        control={control}
        name="floorplanMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id={`floor-plan-new-${buildingId}`}
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
      <Button type="submit" size="sm" variant="ghost" disabled={busy}>
        {busy ? t("adding") : t("addFloor")}
      </Button>
    </form>
  );
};
