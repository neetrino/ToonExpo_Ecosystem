"use client";

import type { BoothAssignmentSummary } from "@toonexpo/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ADMIN_COMPANIES_DEFAULT_PAGE_SIZE } from "@/features/admin/constants";
import {
  useAdminCompaniesQuery,
  useAdminCompanyProjectsQuery,
} from "@/features/admin/hooks/use-admin-companies";
import {
  useCreateAdminBoothAssignmentMutation,
  useDeleteAdminBoothAssignmentMutation,
} from "@/features/exhibition/hooks/use-exhibition";
import {
  boothAssignmentFormSchema,
  type BoothAssignmentFormInput,
  type BoothAssignmentFormValues,
} from "@/features/exhibition/schemas/exhibition.schema";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type AdminBoothAssignmentsPanelProps = {
  boothId: string;
};

/**
 * Booth assignment create/list panel.
 * Note: backend has no list endpoint — assignments persist in session state after create.
 */
export const AdminBoothAssignmentsPanel = ({
  boothId,
}: AdminBoothAssignmentsPanelProps) => {
  const t = useTranslations("Admin.events.booths.assignments");
  const [assignments, setAssignments] = useState<BoothAssignmentSummary[]>([]);
  const createMutation = useCreateAdminBoothAssignmentMutation(boothId);
  const deleteMutation = useDeleteAdminBoothAssignmentMutation(boothId);
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_DEFAULT_PAGE_SIZE);

  const form = useForm<BoothAssignmentFormInput, unknown, BoothAssignmentFormValues>({
    resolver: zodResolver(boothAssignmentFormSchema),
    defaultValues: {
      companyId: "",
      projectId: "",
      assignmentLabel: "",
      active: true,
    },
  });

  const companyId = form.watch("companyId") ?? "";
  const projectsQuery = useAdminCompanyProjectsQuery(companyId, companyId.length > 0);

  const onSubmit = form.handleSubmit(async (values) => {
    const created = await createMutation.mutateAsync({
      ...(values.companyId ? { companyId: values.companyId } : {}),
      ...(values.projectId ? { projectId: values.projectId } : {}),
      ...(values.assignmentLabel ? { assignmentLabel: values.assignmentLabel } : {}),
      active: values.active,
    });
    setAssignments((current) => [...current, created]);
    form.reset({ companyId: "", projectId: "", assignmentLabel: "", active: true });
  });

  const onRemove = async (assignmentId: string) => {
    await deleteMutation.mutateAsync(assignmentId);
    setAssignments((current) => current.filter((item) => item.id !== assignmentId));
  };

  return (
    <div className="flex flex-col gap-4 rounded-sm border border-border p-4">
      <div>
        <h4 className="text-sm font-semibold text-ink">{t("title")}</h4>
        <p className="mt-1 text-xs text-ink-muted">{t("listGapHint")}</p>
      </div>
      {assignments.length > 0 ? (
        <ul className="flex flex-col gap-2 text-sm">
          {assignments.map((assignment) => (
            <li
              key={assignment.id}
              className="flex items-center justify-between gap-2 rounded-sm bg-surface px-3 py-2"
            >
              <span>
                {assignment.assignmentLabel ??
                  assignment.companyId ??
                  assignment.projectId ??
                  assignment.id.slice(0, 8)}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  void onRemove(assignment.id);
                }}
              >
                {t("remove")}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
      )}
      <form className="flex flex-col gap-3" onSubmit={onSubmit} noValidate>
        <FormField id="assignment-company" label={t("company")}>
          <select
            id="assignment-company"
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
        <FormField id="assignment-project" label={t("project")}>
          <select
            id="assignment-project"
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
        <FormField id="assignment-label" label={t("label")}>
          <Input id="assignment-label" {...form.register("assignmentLabel")} />
        </FormField>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("active")} />
          {t("active")}
        </label>
        <Button type="submit" size="sm" variant="secondary" disabled={createMutation.isPending}>
          {createMutation.isPending ? t("adding") : t("add")}
        </Button>
      </form>
    </div>
  );
};
