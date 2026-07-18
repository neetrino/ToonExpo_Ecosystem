"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { PortalProjectDetail } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { TranslationTabs } from "@/features/builder/components/translation-tabs";
import { useUpdatePortalProjectMutation } from "@/features/builder/hooks/use-portal-projects";
import {
  updateProjectSchema,
  type UpdateProjectFormValues,
} from "@/features/builder/schemas/project.schema";
import { toUpdateProjectRequest } from "@/features/builder/utils/project-mappers";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type EditProjectFormProps = {
  project: PortalProjectDetail;
};

const toFormValues = (project: PortalProjectDetail): UpdateProjectFormValues => ({
  nameHy: project.name,
  nameRu: "",
  nameEn: "",
  slug: project.slug,
  shortDescriptionHy: project.shortDescription ?? "",
  shortDescriptionRu: "",
  shortDescriptionEn: "",
  fullDescriptionHy: project.fullDescription ?? "",
  fullDescriptionRu: "",
  fullDescriptionEn: "",
  locationTextHy: project.locationText ?? "",
  locationTextRu: "",
  locationTextEn: "",
  address: project.address ?? "",
  city: project.city ?? "",
  district: project.district ?? "",
  projectType: project.projectType ?? "",
  constructionStatus: project.constructionStatus ?? "",
  completionDate: project.completionDate ?? "",
});

/**
 * Edit form for portal project fields and translations.
 */
export const EditProjectForm = ({ project }: EditProjectFormProps) => {
  const t = useTranslations("Builder.projects");
  const updateMutation = useUpdatePortalProjectMutation(project.id);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: toFormValues(project),
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSuccess(false);
    try {
      await updateMutation.mutateAsync(toUpdateProjectRequest(values));
      setSuccess(true);
    } catch {
      setFormError(t("errors.generic"));
    }
  });

  const busy = isSubmitting || updateMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <TranslationTabs>
        {(locale) => (
          <div className="flex flex-col gap-4">
            <FormField
              id={`edit-name-${locale}`}
              label={t("form.name")}
              error={
                locale === "hy" && errors.nameHy
                  ? t("validation.name")
                  : undefined
              }
            >
              <Input
                id={`edit-name-${locale}`}
                {...register(
                  locale === "hy"
                    ? "nameHy"
                    : locale === "ru"
                      ? "nameRu"
                      : "nameEn",
                )}
              />
            </FormField>
            <FormField
              id={`edit-short-${locale}`}
              label={t("form.shortDescription")}
            >
              <textarea
                id={`edit-short-${locale}`}
                rows={2}
                className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                {...register(
                  locale === "hy"
                    ? "shortDescriptionHy"
                    : locale === "ru"
                      ? "shortDescriptionRu"
                      : "shortDescriptionEn",
                )}
              />
            </FormField>
            <FormField
              id={`edit-full-${locale}`}
              label={t("form.fullDescription")}
            >
              <textarea
                id={`edit-full-${locale}`}
                rows={4}
                className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                {...register(
                  locale === "hy"
                    ? "fullDescriptionHy"
                    : locale === "ru"
                      ? "fullDescriptionRu"
                      : "fullDescriptionEn",
                )}
              />
            </FormField>
            <FormField
              id={`edit-location-${locale}`}
              label={t("form.locationText")}
            >
              <Input
                id={`edit-location-${locale}`}
                {...register(
                  locale === "hy"
                    ? "locationTextHy"
                    : locale === "ru"
                      ? "locationTextRu"
                      : "locationTextEn",
                )}
              />
            </FormField>
          </div>
        )}
      </TranslationTabs>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="edit-slug" label={t("form.slug")}>
          <Input id="edit-slug" {...register("slug")} />
        </FormField>
        <FormField id="edit-address" label={t("form.address")}>
          <Input id="edit-address" {...register("address")} />
        </FormField>
        <FormField id="edit-city" label={t("form.city")}>
          <Input id="edit-city" {...register("city")} />
        </FormField>
        <FormField id="edit-district" label={t("form.district")}>
          <Input id="edit-district" {...register("district")} />
        </FormField>
        <FormField id="edit-type" label={t("form.projectType")}>
          <Input id="edit-type" {...register("projectType")} />
        </FormField>
        <FormField id="edit-status" label={t("form.constructionStatus")}>
          <Input id="edit-status" {...register("constructionStatus")} />
        </FormField>
        <FormField id="edit-completion" label={t("form.completionDate")}>
          <Input
            id="edit-completion"
            type="date"
            {...register("completionDate")}
          />
        </FormField>
      </div>

      {formError ? (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="text-sm text-success">
          {t("detail.saveSuccess")}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" disabled={busy || !isDirty}>
        {busy ? t("detail.saving") : t("detail.save")}
      </Button>
    </form>
  );
};
