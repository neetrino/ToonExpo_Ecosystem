import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';

export const READINESS_ASSESSMENT_FILTER_COMPANY_KEY = 'companyId';
export const READINESS_ASSESSMENT_FILTER_PROJECT_KEY = 'projectId';

type NamedOption = { id: string; name: string };

type ReadinessAssessmentFilterLabels = {
  company: string;
  allCompanies: string;
  project: string;
  allProjects: string;
};

/**
 * Company + project filters for the admin readiness list.
 */
export const buildReadinessAssessmentFilterConfigs = (
  companyOptions: readonly NamedOption[],
  projectOptions: readonly NamedOption[],
  labels: ReadinessAssessmentFilterLabels,
): IntegratedSearchFilterConfig[] => [
  {
    key: READINESS_ASSESSMENT_FILTER_COMPANY_KEY,
    label: labels.company,
    allOptionLabel: labels.allCompanies,
    options: companyOptions.map((company) => ({ value: company.id, label: company.name })),
  },
  {
    key: READINESS_ASSESSMENT_FILTER_PROJECT_KEY,
    label: labels.project,
    allOptionLabel: labels.allProjects,
    options: projectOptions.map((project) => ({ value: project.id, label: project.name })),
  },
];
