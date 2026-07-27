import type { ReadinessAssessmentTargetType, ReadinessScoreStatus } from '@toonexpo/contracts';

import { READINESS_SCORE_STATUSES, READINESS_TARGET_TYPES } from '@/features/readiness/constants';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';

export const READINESS_ASSESSMENT_FILTER_COMPANY_KEY = 'companyId';
export const READINESS_ASSESSMENT_FILTER_TARGET_TYPE_KEY = 'targetType';
export const READINESS_ASSESSMENT_FILTER_STATUS_KEY = 'status';

export type ReadinessAssessmentFiltersState = {
  companyId: string;
  targetType: ReadinessAssessmentTargetType | '';
  status: ReadinessScoreStatus | '';
};

export const EMPTY_READINESS_ASSESSMENT_FILTERS: ReadinessAssessmentFiltersState = {
  companyId: '',
  targetType: '',
  status: '',
};

type CompanyOption = { id: string; name: string };

type ReadinessAssessmentFilterLabels = {
  company: string;
  allCompanies: string;
  targetType: string;
  allTargets: string;
  status: string;
  allStatuses: string;
  targetTypeOption: (type: ReadinessAssessmentTargetType) => string;
  statusOption: (status: ReadinessScoreStatus) => string;
};

/**
 * Filter configs for admin readiness assessments integrated search.
 */
export const buildReadinessAssessmentFilterConfigs = (
  companyOptions: readonly CompanyOption[],
  labels: ReadinessAssessmentFilterLabels,
): IntegratedSearchFilterConfig[] => [
  {
    key: READINESS_ASSESSMENT_FILTER_COMPANY_KEY,
    label: labels.company,
    allOptionLabel: labels.allCompanies,
    options: companyOptions.map((company) => ({ value: company.id, label: company.name })),
  },
  {
    key: READINESS_ASSESSMENT_FILTER_TARGET_TYPE_KEY,
    label: labels.targetType,
    allOptionLabel: labels.allTargets,
    options: READINESS_TARGET_TYPES.map((type) => ({
      value: type,
      label: labels.targetTypeOption(type),
    })),
  },
  {
    key: READINESS_ASSESSMENT_FILTER_STATUS_KEY,
    label: labels.status,
    allOptionLabel: labels.allStatuses,
    options: READINESS_SCORE_STATUSES.map((item) => ({
      value: item,
      label: labels.statusOption(item),
    })),
  },
];

export const readinessAssessmentFiltersToRecord = (
  value: ReadinessAssessmentFiltersState,
): Record<string, string> => ({
  [READINESS_ASSESSMENT_FILTER_COMPANY_KEY]: value.companyId,
  [READINESS_ASSESSMENT_FILTER_TARGET_TYPE_KEY]: value.targetType,
  [READINESS_ASSESSMENT_FILTER_STATUS_KEY]: value.status,
});

export const applyReadinessAssessmentFilterKey = (
  prev: ReadinessAssessmentFiltersState,
  key: string,
  nextValue: string,
): ReadinessAssessmentFiltersState => {
  if (key === READINESS_ASSESSMENT_FILTER_COMPANY_KEY) {
    return { ...prev, companyId: nextValue };
  }
  if (key === READINESS_ASSESSMENT_FILTER_TARGET_TYPE_KEY) {
    return { ...prev, targetType: nextValue as ReadinessAssessmentTargetType | '' };
  }
  if (key === READINESS_ASSESSMENT_FILTER_STATUS_KEY) {
    return { ...prev, status: nextValue as ReadinessScoreStatus | '' };
  }
  return prev;
};
