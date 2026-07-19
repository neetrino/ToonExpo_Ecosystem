"use client";

import type { CrmDealStatus, RequestSource } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

import {
  CRM_DEAL_STATUSES,
  CRM_REQUEST_SOURCES,
} from "@/features/builder/schemas/crm.schema";
import { cn } from "@/shared/ui/cn";

export type CrmDealFiltersState = {
  status: CrmDealStatus | "";
  source: RequestSource | "";
  projectId: string;
  assignedUserId: string;
};

type ProjectOption = { id: string; name: string };
type AssigneeOption = { id: string; name: string };

type CrmDealFiltersProps = {
  value: CrmDealFiltersState;
  projects: ProjectOption[];
  assignees: AssigneeOption[];
  onChange: (next: CrmDealFiltersState) => void;
};

/**
 * Status tabs + source/project selects for the CRM list.
 */
export const CrmDealFilters = ({
  value,
  projects,
  assignees,
  onChange,
}: CrmDealFiltersProps) => {
  const t = useTranslations("Builder.crm");

  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        <FilterTab
          active={value.status === ""}
          label={t("filters.allStatuses")}
          onClick={() => {
            onChange({ ...value, status: "" });
          }}
        />
        {CRM_DEAL_STATUSES.map((status) => (
          <FilterTab
            key={status}
            active={value.status === status}
            label={t(`statuses.${status}`)}
            onClick={() => {
              onChange({ ...value, status });
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {t("filters.source")}
          </span>
          <select
            className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-ink"
            value={value.source}
            onChange={(event) => {
              onChange({
                ...value,
                source: event.target.value as RequestSource | "",
              });
            }}
          >
            <option value="">{t("filters.allSources")}</option>
            {CRM_REQUEST_SOURCES.map((source) => (
              <option key={source} value={source}>
                {t(`sources.${source}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {t("filters.project")}
          </span>
          <select
            className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-ink"
            value={value.projectId}
            onChange={(event) => {
              onChange({ ...value, projectId: event.target.value });
            }}
          >
            <option value="">{t("filters.allProjects")}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {t("filters.assignee")}
          </span>
          <select
            className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-ink"
            value={value.assignedUserId}
            onChange={(event) => {
              onChange({ ...value, assignedUserId: event.target.value });
            }}
          >
            <option value="">{t("filters.allAssignees")}</option>
            {assignees.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

type FilterTabProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

const FilterTab = ({ active, label, onClick }: FilterTabProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "shrink-0 rounded-pill px-3 py-1.5 text-xs font-medium transition-colors",
      active
        ? "bg-cta-dark text-on-dark"
        : "border border-border text-ink-secondary hover:bg-surface",
    )}
  >
    {label}
  </button>
);
