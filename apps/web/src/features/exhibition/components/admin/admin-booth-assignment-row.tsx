"use client";

import type { BoothAssignmentDetail } from "@toonexpo/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ADMIN_COMPANIES_DEFAULT_PAGE_SIZE } from "@/features/admin/constants";
import {
  useAdminCompaniesQuery,
  useAdminCompanyProjectsQuery,
} from "@/features/admin/hooks/use-admin-companies";
import { useUpdateAdminBoothAssignmentMutation } from "@/features/exhibition/hooks/use-exhibition";
import {
  boothAssignmentFormSchema,
  type BoothAssignmentFormInput,
  type BoothAssignmentFormValues,
} from "@/features/exhibition/schemas/exhibition.schema";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type AdminBoothAssignmentRowProps = {
  boothId: string;
  assignment: BoothAssignmentDetail;
  displayName: string;
  onRemove: (assignmentId: string) => Promise<void>;
  removePending: boolean;
};

/**
 * Inline edit/remove row for a booth assignment.
 */
export const AdminBoothAssignmentRow = ({
  boothId,
  assignment,
  displayName,
  onRemove,
  removePending,
}: AdminBoothAssignmentRowProps) => {
  const t = useTranslations("Admin.events.booths.assignments");
  const [editing, setEditing] = useState(false);
  const updateMutation = useUpdateAdminBoothAssignmentMutation(boothId);
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_DEFAULT_PAGE_SIZE);

  const form = useForm<BoothAssignmentFormInput, unknown, BoothAssignmentFormValues>({
    resolver: zodResolver(boothAssignmentFormSchema),
    defaultValues: {
      companyId: assignment.companyId ?? "",
      projectId: assignment.projectId ?? "",
      assignmentLabel: assignment.assignmentLabel ?? "",
      active: assignment.active,
    },
  });

  const companyId = form.watch("companyId") ?? "";
  const projectsQuery = useAdminCompanyProjectsQuery(companyId, companyId.length > 0);

  const onSubmit = form.handleSubmit(async (values) => {
    await updateMutation.mutateAsync({
      assignmentId: assignment.id,
      body: {
        ...(values.companyId ? { companyId: values.companyId } : { companyId: null }),
        ...(values.projectId ? { projectId: values.projectId } : { projectId: null }),
        assignmentLabel: values.assignmentLabel ?? null,
        active: values.active,
      },
    });
    setEditing(false);
  });

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-2 rounded-sm bg-surface px-3 py-2">
        <span>{displayName}</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditing(true);
            }}
          >
            {t("edit")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={removePending}
            onClick={() => {
              void onRemove(assignment.id);
            }}
          >
            {t("remove")}
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-sm border border-border bg-surface p-3">
      <form className="flex flex-col gap-3" onSubmit={onSubmit} noValidate>
        <FormField id={`assignment-company-${assignment.id}`} label={t("company")}>
          <select
            id={`assignment-company-${assignment.id}`}
            className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm"
            {...form.register("companyId")}
          >
            <option value="">{t("noCompany")}</option>
            {(companiesQuery.data?.data ?? []).map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id={`assignment-project-${assignment.id}`} label={t("project")}>
          <select
            id={`assignment-project-${assignment.id}`}
            className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm"
            {...form.register("projectId")}
            disabled={!companyId}
          >
            <option value="">{t("noProject")}</option>
            {(projectsQuery.data?.data ?? []).map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id={`assignment-label-${assignment.id}`} label={t("label")}>
          <Input
            id={`assignment-label-${assignment.id}`}
            {...form.register("assignmentLabel")}
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("active")} />
          {t("active")}
        </label>
        <div className="flex gap-2">
          <Button type="submit" size="sm" variant="secondary" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? t("saving") : t("save")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditing(false);
              form.reset();
            }}
          >
            {t("cancel")}
          </Button>
        </div>
      </form>
    </li>
  );
};
