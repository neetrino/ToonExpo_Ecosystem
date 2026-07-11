'use client';

import { BUILDING_NAME_MAX_LENGTH } from '@toonexpo/contracts';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import { PortalFormField, PortalTextInput } from '@/components/portal-forms/form-fields';
import { useCloseOnFormSuccess } from '@/components/portal-forms/use-close-on-form-success';

import {
  INITIAL_BUILDER_FORM_ACTION_STATE,
  type BuilderFormActionState,
} from '@/lib/builder/action-state';
import { createBuildingFormAction, updateBuildingFormAction } from '@/lib/builder/form-actions';

type BuildingFormValues = {
  buildingId?: string;
  projectId?: string;
  name: string;
};

type BuildingFormSheetProps = {
  locale: string;
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  values: BuildingFormValues;
};

export function BuildingFormSheet({ locale, mode, open, onClose, values }: BuildingFormSheetProps) {
  const t = useTranslations('portal.buildingForm');
  const action =
    mode === 'create'
      ? createBuildingFormAction.bind(null, locale)
      : updateBuildingFormAction.bind(null, locale);

  const [state, formAction, pending] = useActionState(action, INITIAL_BUILDER_FORM_ACTION_STATE);

  useCloseOnFormSuccess(state, open, onClose);

  return (
    <SideSheet title={t(mode)} open={open} onClose={onClose}>
      <BuildingFormBody
        mode={mode}
        values={values}
        state={state}
        formAction={formAction}
        pending={pending}
      />
    </SideSheet>
  );
}

type BuildingFormBodyProps = {
  mode: 'create' | 'edit';
  values: BuildingFormValues;
  state: BuilderFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function BuildingFormBody({ mode, values, state, formAction, pending }: BuildingFormBodyProps) {
  const t = useTranslations('portal.buildingForm');

  return (
    <form action={formAction} className="portal-form">
      {mode === 'create' && values.projectId ? (
        <input type="hidden" name="projectId" value={values.projectId} />
      ) : null}
      {mode === 'edit' && values.buildingId ? (
        <input type="hidden" name="buildingId" value={values.buildingId} />
      ) : null}

      <PortalFormField label={t('fields.name')} name="name">
        <PortalTextInput
          name="name"
          defaultValue={values.name}
          required
          maxLength={BUILDING_NAME_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormError errorKey={state.errorKey} />

      <div className="portal-form__actions">
        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('submit')}
        </button>
      </div>
    </form>
  );
}
