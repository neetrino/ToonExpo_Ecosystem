"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { CompanyResponse } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { useCreateReadinessAssessmentMutation } from "@/features/admin/hooks/use-admin-readiness";
import {
  createReadinessAssessmentSchema,
  type CreateReadinessAssessmentFormValues,
} from "@/features/admin/schemas/readiness.schema";
import { READINESS_TARGET_TYPES } from "@/features/readiness/constants";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

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
              label={t("create.projectId")}
              error={
                form.formState.errors.projectId
                  ? t("validation.projectId")
                  : undefined
              }
            >
              <Input id="projectId" {...form.register("projectId")} />
              <p className="mt-1 text-xs text-ink-muted">
                {t("create.projectIdHint")}
              </p>
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
