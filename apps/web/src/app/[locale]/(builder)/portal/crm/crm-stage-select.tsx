'use client';

import type { DealStage } from '@toonexpo/domain';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import { PortalSelect } from '@/components/portal-forms/form-fields';
import { useRefreshOnFormSuccess } from '@/components/portal-forms/use-refresh-on-form-success';
import { INITIAL_CRM_FORM_ACTION_STATE, type CrmFormActionState } from '@/lib/crm/action-state';
import { updateDealStageFormAction } from '@/lib/crm/form-actions';

type CrmStageSelectProps = {
  locale: string;
  dealId: string;
  currentStage: DealStage;
  stages: readonly DealStage[];
  compact?: boolean;
};

export function CrmStageSelect({
  locale,
  dealId,
  currentStage,
  stages,
  compact = false,
}: CrmStageSelectProps) {
  const t = useTranslations('portal.crm.stages');
  const [state, formAction, pending] = useActionState(
    updateDealStageFormAction.bind(null, locale),
    INITIAL_CRM_FORM_ACTION_STATE,
  );

  useRefreshOnFormSuccess(state, true);

  return (
    <CrmStageSelectForm
      dealId={dealId}
      currentStage={currentStage}
      stages={stages}
      compact={compact}
      state={state}
      formAction={formAction}
      pending={pending}
      stageLabel={(stage) => t(stage)}
    />
  );
}

type CrmStageSelectFormProps = {
  dealId: string;
  currentStage: DealStage;
  stages: readonly DealStage[];
  compact: boolean;
  state: CrmFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
  stageLabel: (stage: DealStage) => string;
};

function CrmStageSelectForm({
  dealId,
  currentStage,
  stages,
  compact,
  state,
  formAction,
  pending,
  stageLabel,
}: CrmStageSelectFormProps) {
  return (
    <form
      action={formAction}
      className={compact ? 'crm-stage-select crm-stage-select--compact' : 'crm-stage-select'}
      onChange={(event) => {
        const form = event.currentTarget;
        if (event.target instanceof HTMLSelectElement) {
          form.requestSubmit();
        }
      }}
    >
      <input type="hidden" name="dealId" value={dealId} />
      <PortalSelect name="stage" defaultValue={currentStage} required>
        {stages.map((stage) => (
          <option key={stage} value={stage}>
            {stageLabel(stage)}
          </option>
        ))}
      </PortalSelect>
      <PortalFormError errorKey={state.errorKey} namespace="portal.crm.errors" />
      {pending ? <span className="crm-stage-select__pending" aria-hidden="true" /> : null}
    </form>
  );
}
