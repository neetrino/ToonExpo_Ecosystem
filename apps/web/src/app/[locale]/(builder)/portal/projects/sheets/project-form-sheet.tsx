'use client';

import {
  PROJECT_CITY_ADDRESS_MAX_LENGTH,
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
} from '@toonexpo/contracts';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import {
  PortalFormField,
  PortalTextArea,
  PortalTextInput,
} from '@/components/portal-forms/form-fields';
import { useCloseOnFormSuccess } from '@/components/portal-forms/use-close-on-form-success';

import {
  INITIAL_BUILDER_FORM_ACTION_STATE,
  type BuilderFormActionState,
} from '@/lib/builder/action-state';
import { createProjectFormAction, updateProjectFormAction } from '@/lib/builder/form-actions';

type ProjectFormValues = {
  projectId?: string;
  name: string;
  city?: string | null;
  address?: string | null;
  description?: string | null;
};

type ProjectFormSheetProps = {
  locale: string;
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  values?: ProjectFormValues;
};

export function ProjectFormSheet({ locale, mode, open, onClose, values }: ProjectFormSheetProps) {
  const t = useTranslations('portal.projectForm');
  const action =
    mode === 'create'
      ? createProjectFormAction.bind(null, locale)
      : updateProjectFormAction.bind(null, locale);

  const [state, formAction, pending] = useActionState(action, INITIAL_BUILDER_FORM_ACTION_STATE);

  useCloseOnFormSuccess(state, open, onClose);

  return (
    <SideSheet title={t(mode)} open={open} onClose={onClose}>
      <ProjectFormBody
        mode={mode}
        values={values}
        state={state}
        formAction={formAction}
        pending={pending}
      />
    </SideSheet>
  );
}

type ProjectFormBodyProps = {
  mode: 'create' | 'edit';
  values?: ProjectFormValues;
  state: BuilderFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function ProjectFormBody({ mode, values, state, formAction, pending }: ProjectFormBodyProps) {
  const t = useTranslations('portal.projectForm');

  return (
    <form action={formAction} className="portal-form">
      {mode === 'edit' && values?.projectId ? (
        <input type="hidden" name="projectId" value={values.projectId} />
      ) : null}

      <PortalFormField label={t('fields.name')} name="name">
        <PortalTextInput
          name="name"
          defaultValue={values?.name}
          required
          maxLength={PROJECT_NAME_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.city')} name="city">
        <PortalTextInput
          name="city"
          defaultValue={values?.city ?? undefined}
          maxLength={PROJECT_CITY_ADDRESS_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.address')} name="address">
        <PortalTextInput
          name="address"
          defaultValue={values?.address ?? undefined}
          maxLength={PROJECT_CITY_ADDRESS_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.description')} name="description">
        <PortalTextArea
          name="description"
          defaultValue={values?.description ?? undefined}
          maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
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
