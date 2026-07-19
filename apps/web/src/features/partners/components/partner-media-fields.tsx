"use client";

import type { MediaUploadContext } from "@/features/media/api/media-api";
import { MediaUploadField } from "@/features/media/components/media-upload-field";
import { useTranslations } from "next-intl";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";

export type PartnerMediaFieldValues = {
  logoMediaId: string;
  coverMediaId: string;
};

type PartnerMediaFieldsProps = {
  control: Control<PartnerMediaFieldValues>;
  context: MediaUploadContext;
  logoPreviewUrl?: string | null | undefined;
  coverPreviewUrl?: string | null | undefined;
};

/**
 * Logo and cover image pickers for partner admin and portal forms.
 */
export const PartnerMediaFields = ({
  control,
  context,
  logoPreviewUrl,
  coverPreviewUrl,
}: PartnerMediaFieldsProps) => {
  const t = useTranslations("Partners.form");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Controller
        control={control}
        name="logoMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id="partner-logo"
            label={t("logoMedia")}
            context={context}
            value={field.value}
            onChange={field.onChange}
            previewUrl={logoPreviewUrl}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="coverMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id="partner-cover"
            label={t("coverMedia")}
            context={context}
            value={field.value}
            onChange={field.onChange}
            previewUrl={coverPreviewUrl}
            error={fieldState.error?.message}
          />
        )}
      />
    </div>
  );
};
