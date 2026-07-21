'use client';

import type { ReadinessAssessmentTargetType, ReadinessScoreStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { READINESS_SCORE_STATUSES, READINESS_TARGET_TYPES } from '@/features/readiness/constants';
import { selectFieldClassName } from '@/shared/ui/select';

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

const selectClassName = `${selectFieldClassName} h-10`;

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
    <div className="flex flex-wrap gap-3">
      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        {t('company')}
        <select
          className={selectClassName}
          value={companyId}
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
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        {t('targetType')}
        <select
          className={selectClassName}
          value={targetType}
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
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        {t('status')}
        <select
          className={selectClassName}
          value={status}
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
        </select>
      </label>
    </div>
  );
};
