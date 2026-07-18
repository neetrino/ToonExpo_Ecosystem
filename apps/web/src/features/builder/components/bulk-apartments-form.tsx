"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useBulkCreateApartmentsMutation } from "@/features/builder/hooks/use-portal-inventory";
import {
  bulkApartmentsSchema,
  type BulkApartmentsFormValues,
} from "@/features/builder/schemas/inventory.schema";
import { buildBulkApartments } from "@/features/builder/utils/project-mappers";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type BulkApartmentsFormProps = {
  projectId: string;
  floorId: string;
  onDone?: () => void;
};

/**
 * Bulk apartment creation form for a floor.
 */
export const BulkApartmentsForm = ({
  projectId,
  floorId,
  onDone,
}: BulkApartmentsFormProps) => {
  const t = useTranslations("Builder.inventory");
  const mutation = useBulkCreateApartmentsMutation(projectId, floorId);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BulkApartmentsFormValues>({
    resolver: zodResolver(bulkApartmentsSchema),
    defaultValues: {
      count: "4",
      numberPrefix: "",
      startNumber: "1",
      rooms: "",
      bedrooms: "",
      bathrooms: "",
      areaTotal: "",
      price: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await mutation.mutateAsync({ apartments: buildBulkApartments(values) });
      onDone?.();
    } catch {
      setError(t("errors.generic"));
    }
  });

  const busy = isSubmitting || mutation.isPending;

  return (
    <form
      onSubmit={onSubmit}
      className="mt-2 flex flex-col gap-2 rounded-sm border border-border bg-background p-3"
      noValidate
    >
      <p className="text-sm font-medium text-ink">{t("addApartments")}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <FormField
          id={`bulk-count-${floorId}`}
          label={t("count")}
          error={errors.count ? t("validation.count") : undefined}
        >
          <Input
            id={`bulk-count-${floorId}`}
            type="number"
            {...register("count")}
          />
        </FormField>
        <FormField id={`bulk-prefix-${floorId}`} label={t("numberPrefix")}>
          <Input id={`bulk-prefix-${floorId}`} {...register("numberPrefix")} />
        </FormField>
        <FormField id={`bulk-start-${floorId}`} label={t("startNumber")}>
          <Input
            id={`bulk-start-${floorId}`}
            type="number"
            {...register("startNumber")}
          />
        </FormField>
        <FormField id={`bulk-rooms-${floorId}`} label={t("rooms")}>
          <Input id={`bulk-rooms-${floorId}`} {...register("rooms")} />
        </FormField>
        <FormField id={`bulk-area-${floorId}`} label={t("areaTotal")}>
          <Input id={`bulk-area-${floorId}`} {...register("areaTotal")} />
        </FormField>
        <FormField id={`bulk-price-${floorId}`} label={t("price")}>
          <Input id={`bulk-price-${floorId}`} {...register("price")} />
        </FormField>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="sm" variant="secondary" disabled={busy}>
        {busy ? t("adding") : t("createApartments")}
      </Button>
    </form>
  );
};
