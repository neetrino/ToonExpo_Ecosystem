import type { CrmDealStatus, RequestSource } from '@toonexpo/contracts';

import { CRM_DEAL_STATUSES, CRM_REQUEST_SOURCES } from '@/features/builder/schemas/crm.schema';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';

export type CrmDealFiltersState = {
  status: CrmDealStatus | '';
  source: RequestSource | '';
  projectId: string;
  assignedUserId: string;
};

export const EMPTY_CRM_DEAL_FILTERS: CrmDealFiltersState = {
  status: '',
  source: '',
  projectId: '',
  assignedUserId: '',
};

type ProjectOption = { id: string; name: string };
type AssigneeOption = { id: string; name: string };

type BuildCrmDealFilterConfigsParams = {
  projects: readonly ProjectOption[];
  assignees: readonly AssigneeOption[];
  labels: {
    status: string;
    allStatuses: string;
    source: string;
    allSources: string;
    project: string;
    allProjects: string;
    assignee: string;
    allAssignees: string;
    statusOption: (status: CrmDealStatus) => string;
    sourceOption: (source: RequestSource) => string;
  };
};

/**
 * Filter configs for CRM integrated search (status / source / project / assignee).
 */
export const buildCrmDealFilterConfigs = ({
  projects,
  assignees,
  labels,
}: BuildCrmDealFilterConfigsParams): IntegratedSearchFilterConfig[] => [
  {
    key: 'status',
    label: labels.status,
    allOptionLabel: labels.allStatuses,
    options: CRM_DEAL_STATUSES.map((status) => ({
      value: status,
      label: labels.statusOption(status),
    })),
  },
  {
    key: 'source',
    label: labels.source,
    allOptionLabel: labels.allSources,
    options: CRM_REQUEST_SOURCES.map((source) => ({
      value: source,
      label: labels.sourceOption(source),
    })),
  },
  {
    key: 'projectId',
    label: labels.project,
    allOptionLabel: labels.allProjects,
    options: projects.map((project) => ({
      value: project.id,
      label: project.name,
    })),
  },
  {
    key: 'assignedUserId',
    label: labels.assignee,
    allOptionLabel: labels.allAssignees,
    options: assignees.map((member) => ({
      value: member.id,
      label: member.name,
    })),
  },
];

export const crmDealFiltersToRecord = (value: CrmDealFiltersState): Record<string, string> => ({
  status: value.status,
  source: value.source,
  projectId: value.projectId,
  assignedUserId: value.assignedUserId,
});

export const applyCrmDealFilterKey = (
  prev: CrmDealFiltersState,
  key: string,
  nextValue: string,
): CrmDealFiltersState => {
  if (key === 'status') {
    return { ...prev, status: nextValue as CrmDealStatus | '' };
  }
  if (key === 'source') {
    return { ...prev, source: nextValue as RequestSource | '' };
  }
  if (key === 'projectId') {
    return { ...prev, projectId: nextValue };
  }
  if (key === 'assignedUserId') {
    return { ...prev, assignedUserId: nextValue };
  }
  return prev;
};
