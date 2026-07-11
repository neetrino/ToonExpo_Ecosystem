'use client';

import { READINESS_TEXT_MAX_LENGTH } from '@toonexpo/contracts';
import type { ReadinessStatus } from '@toonexpo/domain';
import { useTranslations } from 'next-intl';

import {
  PortalFormField,
  PortalSelect,
  PortalTextArea,
  PortalTextInput,
} from '@/components/portal-forms/form-fields';
import type { ReadinessCategoryOption } from '@/lib/admin/readiness-queries';

type CategoryScoreValues = {
  score: number | null;
  status: ReadinessStatus;
  recommendation: string | null;
  requiredActions: string | null;
  internalNote: string | null;
};

type CategoryScoreFieldsProps = {
  category: ReadinessCategoryOption;
  scoreMin: number;
  scoreMax: number;
  statusOptions: ReadinessStatus[];
  values?: CategoryScoreValues;
};

export function CategoryScoreFields({
  category,
  scoreMin,
  scoreMax,
  statusOptions,
  values,
}: CategoryScoreFieldsProps) {
  const t = useTranslations('admin.readiness.form');
  const tStatus = useTranslations('admin.readiness.statuses');
  const tCategories = useTranslations('admin.readiness.categories');

  const title = tCategories.has(category.key) ? tCategories(category.key) : category.name;

  return (
    <fieldset className="portal-section">
      <legend className="portal-section__title">{title}</legend>
      <input type="hidden" name="categoryId" value={category.id} />

      <PortalFormField label={t('fields.score')} name={`score_${category.id}`}>
        <PortalTextInput
          name={`score_${category.id}`}
          type="number"
          min={scoreMin}
          max={scoreMax}
          defaultValue={values?.score ?? undefined}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.categoryStatus')} name={`status_${category.id}`}>
        <PortalSelect
          name={`status_${category.id}`}
          defaultValue={values?.status ?? 'NOT_STARTED'}
          required
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {tStatus(status)}
            </option>
          ))}
        </PortalSelect>
      </PortalFormField>

      <PortalFormField
        label={t('fields.categoryRecommendation')}
        name={`recommendation_${category.id}`}
      >
        <PortalTextArea
          name={`recommendation_${category.id}`}
          defaultValue={values?.recommendation ?? undefined}
          maxLength={READINESS_TEXT_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField
        label={t('fields.categoryRequiredActions')}
        name={`requiredActions_${category.id}`}
      >
        <PortalTextArea
          name={`requiredActions_${category.id}`}
          defaultValue={values?.requiredActions ?? undefined}
          maxLength={READINESS_TEXT_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField
        label={t('fields.categoryInternalNote')}
        name={`internalNote_${category.id}`}
        hint={t('fields.internalNotesHint')}
      >
        <PortalTextArea
          name={`internalNote_${category.id}`}
          defaultValue={values?.internalNote ?? undefined}
          maxLength={READINESS_TEXT_MAX_LENGTH}
        />
      </PortalFormField>
    </fieldset>
  );
}
