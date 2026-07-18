"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { CompanyResponse } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { useAdminCompanyProjectsQuery } from "@/features/admin/hooks/use-admin-companies";
import { useCreateReadinessAssessmentMutation } from "@/features/admin/hooks/use-admin-readiness";
import {
  createReadinessAssessmentSchema,
  type CreateReadinessAssessmentFormValues,
} from "@/features/admin/schemas/readiness.schema";
import { READINESS_TARGET_TYPES } from "@/features/readiness/constants";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";

type ReadinessCreateAssessmentPanelProps = {
  companies: CompanyResponse[];
  onClose: () => void;
};

/**
 * Dialog to create a readiness assessment for a company or project.
 */
export const ReadinessCreateAssessmentPanel = ({
  companies,
  onClose,
}: ReadinessCreateAssessmentPanelProps) => {
  const t = useTranslations("Admin.readiness.assessments");
  const router = useRouter();
  const mutation = useCreateReadinessAssessmentMutation();

  const form = useForm<CreateReadinessAssessmentFormValues>({
    resolver: zodResolver(createReadinessAssessmentSchema),
    defaultValues: {
      targetType: "builder_company",
      builderCompanyId: "",
      projectId: "",
    },
  });

  const targetType = form.watch("targetType");
  const builderCompanyId = form.watch("builderCompanyId");
  const projectsQuery = useAdminCompanyProjectsQuery(
    builderCompanyId,
    targetType === "project",
  );

  useEffect(() => {
    form.setValue("projectId", "");
  }, [builderCompanyId, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await mutation.mutateAsync({
        targetType: values.targetType,
        builderCompanyId: values.builderCompanyId,
        ...(values.targetType === "project"
          ? { projectId: values.projectId }
          : {}),
      });
      onClose();
      router.push(`/admin/readiness/${result.id}`);
    } catch {
      form.setError("root", { message: t("errors.generic") });
    }
  });

  const projectSelectDisabled =
    builderCompanyId.length === 0 || projectsQuery.isLoading;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-assessment-title"
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-lg bg-background p-5 shadow-lg sm:rounded-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2
            id="create-assessment-title"
            className="text-lg font-semibold text-ink"
          >
            {t("create.title")}
          </h2>
          <button
            type="button"
            className="text-sm text-ink-muted hover:text-ink"
            onClick={onClose}
          >
            {t("create.cancel")}
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <FormField id="targetType" label={t("create.targetType")}>
            <select
              id="targetType"
              className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
              {...form.register("targetType")}
            >
              {READINESS_TARGET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`targetTypes.${type}`)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="builderCompanyId"
            label={t("create.company")}
            error={
              form.formState.errors.builderCompanyId
                ? t("validation.company")
                : undefined
            }
          >
            <select
              id="builderCompanyId"
              className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
              {...form.register("builderCompanyId")}
            >
              <option value="">{t("create.selectCompany")}</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </FormField>

          {targetType === "project" ? (
            <FormField
              id="projectId"
              label={t("create.project")}
              error={
                form.formState.errors.projectId
                  ? t("validation.project")
                  : undefined
              }
            >
              <select
                id="projectId"
                className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-60"
                disabled={projectSelectDisabled}
                {...form.register("projectId")}
              >
                <option value="">
                  {builderCompanyId.length === 0
                    ? t("create.selectCompanyFirst")
                    : projectsQuery.isLoading
                      ? t("create.loadingProjects")
                      : t("create.selectProject")}
                </option>
                {(projectsQuery.data?.data ?? []).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} (
                    {t(`create.publicationStatuses.${project.publicationStatus}`)}
                    )
                  </option>
                ))}
              </select>
              {builderCompanyId.length === 0 ? (
                <p className="mt-1 text-xs text-ink-muted">
                  {t("create.selectCompanyFirst")}
                </p>
              ) : null}
              {projectsQuery.isError ? (
                <p role="alert" className="mt-1 text-xs text-danger">
                  {t("create.projectsError")}
                </p>
              ) : null}
              {projectsQuery.isSuccess &&
              projectsQuery.data.data.length === 0 ? (
                <p className="mt-1 text-xs text-ink-muted">
                  {t("create.noProjects")}
                </p>
              ) : null}
            </FormField>
          ) : null}

          {form.formState.errors.root?.message ? (
            <p role="alert" className="text-sm text-danger">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? t("create.submitting") : t("create.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
};
