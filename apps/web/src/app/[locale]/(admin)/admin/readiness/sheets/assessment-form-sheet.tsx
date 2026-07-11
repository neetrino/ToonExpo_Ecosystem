'use client';

import type { AdminReadinessAssessment } from '@toonexpo/contracts';
import {
  READINESS_CONTACT_MAX_LENGTH,
  READINESS_SCORE_MAX,
  READINESS_SCORE_MIN,
  READINESS_TEXT_MAX_LENGTH,
} from '@toonexpo/contracts';
import type { ReadinessStatus, ReadinessTargetType } from '@toonexpo/domain';
import { READINESS_STATUSES, READINESS_TARGET_TYPES } from '@toonexpo/domain';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import {
  PortalFormField,
  PortalSelect,
  PortalTextArea,
  PortalTextInput,
} from '@/components/portal-forms/form-fields';
import { useCloseOnFormSuccess } from '@/components/portal-forms/use-close-on-form-success';
import {
  INITIAL_ADMIN_CATALOG_ACTION_STATE,
  type AdminCatalogActionState,
} from '@/lib/admin/catalog-action-state';
import { upsertAssessmentFormAction } from '@/lib/admin/form-actions';
import type { AdminTargetOption, ReadinessCategoryOption } from '@/lib/admin/readiness-queries';

import { CategoryScoreFields } from './category-score-fields';

type AssessmentFormSheetProps = {
  locale: string;
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  categories: ReadinessCategoryOption[];
  companies: AdminTargetOption[];
  projects: AdminTargetOption[];
  values?: AdminReadinessAssessment;
};

export function AssessmentFormSheet({
  locale,
  mode,
  open,
  onClose,
  categories,
  companies,
  projects,
  values,
}: AssessmentFormSheetProps) {
  const t = useTranslations('admin.readiness.form');
  const action = upsertAssessmentFormAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, INITIAL_ADMIN_CATALOG_ACTION_STATE);

  useCloseOnFormSuccess(state, open, onClose);

  return (
    <SideSheet title={t(mode)} open={open} onClose={onClose}>
      <AssessmentFormBody
        mode={mode}
        values={values}
        categories={categories}
        companies={companies}
        projects={projects}
        state={state}
        formAction={formAction}
        pending={pending}
      />
    </SideSheet>
  );
}

type AssessmentFormBodyProps = {
  mode: 'create' | 'edit';
  values?: AdminReadinessAssessment;
  categories: ReadinessCategoryOption[];
  companies: AdminTargetOption[];
  projects: AdminTargetOption[];
  state: AdminCatalogActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function AssessmentFormBody({
  mode,
  values,
  categories,
  companies,
  projects,
  state,
  formAction,
  pending,
}: AssessmentFormBodyProps) {
  const t = useTranslations('admin.readiness.form');
  const tStatus = useTranslations('admin.readiness.statuses');
  const tTarget = useTranslations('admin.readiness.targets');
  const [targetType, setTargetType] = useState<ReadinessTargetType>(
    values?.targetType ?? 'BUILDER_COMPANY',
  );

  const scoreByCategory = new Map(
    (values?.categoryScores ?? []).map((score) => [score.categoryId, score]),
  );

  return (
    <form action={formAction} className="portal-form">
      {mode === 'edit' && values?.id ? (
        <input type="hidden" name="assessmentId" value={values.id} />
      ) : null}

      <PortalFormField label={t('fields.targetType')} name="targetType">
        <PortalSelect
          name="targetType"
          value={targetType}
          onChange={(event) => setTargetType(event.target.value as ReadinessTargetType)}
          required
        >
          {READINESS_TARGET_TYPES.map((type) => (
            <option key={type} value={type}>
              {tTarget(type)}
            </option>
          ))}
        </PortalSelect>
      </PortalFormField>

      {targetType === 'BUILDER_COMPANY' ? (
        <PortalFormField label={t('fields.company')} name="companyId">
          <PortalSelect name="companyId" defaultValue={values?.companyId ?? ''} required>
            <option value="">{t('fields.companyPlaceholder')}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </PortalSelect>
        </PortalFormField>
      ) : (
        <PortalFormField label={t('fields.project')} name="projectId">
          <PortalSelect name="projectId" defaultValue={values?.projectId ?? ''} required>
            <option value="">{t('fields.projectPlaceholder')}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </PortalSelect>
        </PortalFormField>
      )}

      <PortalFormField label={t('fields.status')} name="status">
        <PortalSelect name="status" defaultValue={values?.status ?? 'IN_PROGRESS'} required>
          {READINESS_STATUSES.map((status) => (
            <option key={status} value={status}>
              {tStatus(status)}
            </option>
          ))}
        </PortalSelect>
      </PortalFormField>

      <PortalFormField label={t('fields.responsibleContact')} name="responsibleContact">
        <PortalTextInput
          name="responsibleContact"
          defaultValue={values?.responsibleContact ?? undefined}
          maxLength={READINESS_CONTACT_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.recommendation')} name="recommendation">
        <PortalTextArea
          name="recommendation"
          defaultValue={values?.recommendation ?? undefined}
          maxLength={READINESS_TEXT_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.requiredActions')} name="requiredActions">
        <PortalTextArea
          name="requiredActions"
          defaultValue={values?.requiredActions ?? undefined}
          maxLength={READINESS_TEXT_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField
        label={t('fields.internalNotes')}
        name="internalNotes"
        hint={t('fields.internalNotesHint')}
      >
        <PortalTextArea
          name="internalNotes"
          defaultValue={values?.internalNotes ?? undefined}
          maxLength={READINESS_TEXT_MAX_LENGTH}
        />
      </PortalFormField>

      <h3 className="portal-section__title">{t('categoriesTitle')}</h3>

      {categories.map((category) => (
        <CategoryScoreFields
          key={category.id}
          category={category}
          scoreMin={READINESS_SCORE_MIN}
          scoreMax={READINESS_SCORE_MAX}
          values={scoreByCategory.get(category.id)}
          statusOptions={READINESS_STATUSES as unknown as ReadinessStatus[]}
        />
      ))}

      <PortalFormError errorKey={state.errorKey} namespace="admin.catalog.errors" />

      <div className="portal-form__actions">
        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('submit')}
        </button>
      </div>
    </form>
  );
}
