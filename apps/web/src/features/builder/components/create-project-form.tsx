"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { TranslationTabs } from "@/features/builder/components/translation-tabs";
import { useCreatePortalProjectMutation } from "@/features/builder/hooks/use-portal-projects";
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from "@/features/builder/schemas/project.schema";
import { toCreateProjectRequest } from "@/features/builder/utils/project-mappers";
import { MediaUploadField } from "@/features/media/components/media-upload-field";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

const emptyValues = (): CreateProjectFormValues => ({
  nameHy: "",
  nameRu: "",
  nameEn: "",
  slug: "",
  shortDescriptionHy: "",
  shortDescriptionRu: "",
  shortDescriptionEn: "",
  fullDescriptionHy: "",
  fullDescriptionRu: "",
  fullDescriptionEn: "",
  locationTextHy: "",
  locationTextRu: "",
  locationTextEn: "",
  address: "",
  city: "",
  district: "",
  projectType: "",
  constructionStatus: "",
  completionDate: "",
  coverMediaId: "",
});

/**
 * Form to create a draft portal project with multilingual fields.
 */
export const CreateProjectForm = () => {
  const t = useTranslations("Builder.projects");
  const router = useRouter();
  const createMutation = useCreatePortalProjectMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: emptyValues(),
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const project = await createMutation.mutateAsync(
        toCreateProjectRequest(values),
      );
      router.push(`/builder/projects/${project.id}`);
    } catch {
      setFormError(t("errors.generic"));
    }
  });

  const busy = isSubmitting || createMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-5" noValidate>
      <TranslationTabs>
        {(locale) => (
          <div className="flex flex-col gap-4">
            <FormField
              id={`name-${locale}`}
              label={t("form.name")}
              error={
                locale === "hy" && errors.nameHy
                  ? t("validation.name")
                  : undefined
              }
            >
              <Input
                id={`name-${locale}`}
                aria-invalid={locale === "hy" && Boolean(errors.nameHy)}
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
              id={`short-${locale}`}
              label={t("form.shortDescription")}
            >
              <textarea
                id={`short-${locale}`}
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
            <FormField id={`full-${locale}`} label={t("form.fullDescription")}>
              <textarea
                id={`full-${locale}`}
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
            <FormField id={`location-${locale}`} label={t("form.locationText")}>
              <Input
                id={`location-${locale}`}
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

      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold text-ink">
          {t("form.detailsSection")}
        </legend>
        <FormField id="slug" label={t("form.slug")}>
          <Input id="slug" {...register("slug")} />
        </FormField>
        <FormField id="address" label={t("form.address")}>
          <Input id="address" {...register("address")} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="city" label={t("form.city")}>
            <Input id="city" {...register("city")} />
          </FormField>
          <FormField id="district" label={t("form.district")}>
            <Input id="district" {...register("district")} />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="projectType" label={t("form.projectType")}>
            <Input id="projectType" {...register("projectType")} />
          </FormField>
          <FormField
            id="constructionStatus"
            label={t("form.constructionStatus")}
          >
            <Input
              id="constructionStatus"
              {...register("constructionStatus")}
            />
          </FormField>
        </div>
        <FormField id="completionDate" label={t("form.completionDate")}>
          <Input
            id="completionDate"
            type="date"
            {...register("completionDate")}
          />
        </FormField>
      </fieldset>

      <Controller
        control={control}
        name="coverMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id="project-cover"
            label={t("form.coverMedia")}
            context="portal"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      {formError ? (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" disabled={busy}>
        {busy ? t("form.submitting") : t("form.submit")}
      </Button>
    </form>
  );
};
