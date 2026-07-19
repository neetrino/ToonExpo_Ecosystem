"use client";

import type { BoothAssignmentDetail } from "@toonexpo/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { ADMIN_COMPANIES_DEFAULT_PAGE_SIZE } from "@/features/admin/constants";
import {
  useAdminCompaniesQuery,
  useAdminCompanyProjectsQuery,
} from "@/features/admin/hooks/use-admin-companies";
import { AdminBoothAssignmentRow } from "@/features/exhibition/components/admin/admin-booth-assignment-row";
import {
  useAdminBoothAssignmentsQuery,
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

const resolveAssignmentDisplayName = (
  assignment: BoothAssignmentDetail,
): string =>
  assignment.assignmentLabel ??
  assignment.projectName ??
  assignment.companyName ??
  assignment.id.slice(0, 8);

/**
 * Booth assignment create/list panel.
 */
export const AdminBoothAssignmentsPanel = ({
  boothId,
}: AdminBoothAssignmentsPanelProps) => {
  const t = useTranslations("Admin.events.booths.assignments");
  const assignmentsQuery = useAdminBoothAssignmentsQuery(boothId);
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
  const assignments = assignmentsQuery.data?.data ?? [];

  const onSubmit = form.handleSubmit(async (values) => {
    await createMutation.mutateAsync({
      ...(values.companyId ? { companyId: values.companyId } : {}),
      ...(values.projectId ? { projectId: values.projectId } : {}),
      ...(values.assignmentLabel ? { assignmentLabel: values.assignmentLabel } : {}),
      active: values.active,
    });
    form.reset({ companyId: "", projectId: "", assignmentLabel: "", active: true });
  });

  const onRemove = async (assignmentId: string) => {
    await deleteMutation.mutateAsync(assignmentId);
  };

  return (
    <div className="flex flex-col gap-4 rounded-sm border border-border p-4">
      <div>
        <h4 className="text-sm font-semibold text-ink">{t("title")}</h4>
      </div>
      {assignmentsQuery.isLoading ? (
        <p className="text-sm text-ink-secondary">{t("loading")}</p>
      ) : assignments.length > 0 ? (
        <ul className="flex flex-col gap-2 text-sm">
          {assignments.map((assignment) => (
            <AdminBoothAssignmentRow
              key={assignment.id}
              boothId={boothId}
              assignment={assignment}
              displayName={resolveAssignmentDisplayName(assignment)}
              onRemove={onRemove}
              removePending={deleteMutation.isPending}
            />
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
