"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useCreateBuildingMutation } from "@/features/builder/hooks/use-portal-inventory";
import {
  createBuildingSchema,
  type CreateBuildingFormValues,
} from "@/features/builder/schemas/inventory.schema";
import { MediaUploadField } from "@/features/media/components/media-upload-field";
import { toOptionalMediaId } from "@/features/media/schemas/media-fields.schema";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type AddBuildingFormProps = {
  projectId: string;
};

/**
 * Inline form to add a building to a project.
 */
export const AddBuildingForm = ({ projectId }: AddBuildingFormProps) => {
  const t = useTranslations("Builder.inventory");
  const mutation = useCreateBuildingMutation(projectId);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBuildingFormValues>({
    resolver: zodResolver(createBuildingSchema),
    defaultValues: { name: "", description: "", coverMediaId: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await mutation.mutateAsync({
        name: values.name,
        ...(values.description.length > 0
          ? { description: values.description }
          : {}),
        ...(toOptionalMediaId(values.coverMediaId)
          ? { coverMediaId: values.coverMediaId }
          : {}),
      });
      reset();
    } catch {
      setError(t("errors.generic"));
    }
  });

  const busy = isSubmitting || mutation.isPending;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-sm border border-border p-3"
      noValidate
    >
      <p className="text-sm font-medium text-ink">{t("addBuilding")}</p>
      <FormField
        id="building-name"
        label={t("buildingName")}
        error={errors.name ? t("validation.name") : undefined}
      >
        <Input id="building-name" {...register("name")} />
      </FormField>
      <FormField id="building-description" label={t("buildingDescription")}>
        <Input id="building-description" {...register("description")} />
      </FormField>
      <Controller
        control={control}
        name="coverMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id="building-cover-new"
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
      <Button type="submit" size="sm" variant="ghost" disabled={busy}>
        {busy ? t("adding") : t("addBuilding")}
      </Button>
    </form>
  );
};
