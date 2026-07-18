"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { useUpdateCompanyProfileMutation } from "@/features/builder/hooks/use-company-profile";
import { MediaUploadField } from "@/features/media/components/media-upload-field";
import {
  optionalMediaIdField,
  toNullableMediaId,
} from "@/features/media/schemas/media-fields.schema";
import { Button } from "@/shared/ui/button";

const companyLogoSchema = z.object({
  logoMediaId: optionalMediaIdField,
});

type CompanyLogoFormValues = z.infer<typeof companyLogoSchema>;

type CompanyProfileFormProps = {
  logoMediaId: string | null;
  logoUrl: string | null;
  canEdit: boolean;
};

/**
 * Builder portal company logo editor for company admins.
 */
export const CompanyProfileForm = ({
  logoMediaId,
  logoUrl,
  canEdit,
}: CompanyProfileFormProps) => {
  const t = useTranslations("Builder.company");
  const mutation = useUpdateCompanyProfileMutation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<CompanyLogoFormValues>({
    resolver: zodResolver(companyLogoSchema),
    defaultValues: { logoMediaId: logoMediaId ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setSuccess(false);
    try {
      await mutation.mutateAsync({
        logoMediaId: toNullableMediaId(values.logoMediaId),
      });
      setSuccess(true);
    } catch {
      setError(t("errors.generic"));
    }
  });

  if (!canEdit) {
    return (
      <p className="text-sm text-ink-secondary">{t("adminOnly")}</p>
    );
  }

  const busy = isSubmitting || mutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4" noValidate>
      <Controller
        control={control}
        name="logoMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id="company-logo"
            label={t("logoMedia")}
            context="portal"
            value={field.value}
            onChange={field.onChange}
            previewUrl={logoUrl}
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
        <p role="status" className="text-sm text-success">
          {t("saveSuccess")}
        </p>
      ) : null}
      <Button type="submit" variant="secondary" disabled={busy || !isDirty}>
        {busy ? t("saving") : t("save")}
      </Button>
    </form>
  );
};
