'use client';

import type { ReadinessAssessmentTargetType, ReadinessScoreStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { READINESS_SCORE_STATUSES, READINESS_TARGET_TYPES } from '@/features/readiness/constants';
import { Select } from '@/shared/ui/select';

type ReadinessAssessmentFiltersProps = {
  companyId: string;
  targetType: ReadinessAssessmentTargetType | '';
  status: ReadinessScoreStatus | '';
  companyOptions: { id: string; name: string }[];
  onChange: (next: {
    companyId: string;
    targetType: ReadinessAssessmentTargetType | '';
    status: ReadinessScoreStatus | '';
  }) => void;
};

const fieldClassName = 'h-10';

/**
 * Filter row for admin readiness assessments list.
 */
export const ReadinessAssessmentFilters = ({
  companyId,
  targetType,
  status,
  companyOptions,
  onChange,
}: ReadinessAssessmentFiltersProps) => {
  const t = useTranslations('Admin.readiness.assessments.filters');

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
      <Select
        size="fit"
        className={fieldClassName}
        value={companyId}
        aria-label={t('company')}
        onChange={(event) => {
          onChange({
            companyId: event.target.value,
            targetType,
            status,
          });
        }}
      >
        <option value="">{t('allCompanies')}</option>
        {companyOptions.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </Select>

      <Select
        size="fit"
        className={fieldClassName}
        value={targetType}
        aria-label={t('targetType')}
        onChange={(event) => {
          onChange({
            companyId,
            targetType: event.target.value as ReadinessAssessmentTargetType | '',
            status,
          });
        }}
      >
        <option value="">{t('allTargets')}</option>
        {READINESS_TARGET_TYPES.map((type) => (
          <option key={type} value={type}>
            {t(`targetTypes.${type}`)}
          </option>
        ))}
      </Select>

      <Select
        size="fit"
        className={fieldClassName}
        value={status}
        aria-label={t('status')}
        onChange={(event) => {
          onChange({
            companyId,
            targetType,
            status: event.target.value as ReadinessScoreStatus | '',
          });
        }}
      >
        <option value="">{t('allStatuses')}</option>
        {READINESS_SCORE_STATUSES.map((item) => (
          <option key={item} value={item}>
            {t(`statuses.${item}`)}
          </option>
        ))}
      </Select>
    </div>
  );
};
