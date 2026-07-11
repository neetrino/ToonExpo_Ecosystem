'use client';

import { FLOOR_NAME_MAX_LENGTH } from '@toonexpo/contracts';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '../../_shared/form-error';
import { PortalFormField, PortalTextInput } from '../../_shared/form-fields';
import { useCloseOnFormSuccess } from '../../_shared/use-close-on-success';

import {
  INITIAL_BUILDER_FORM_ACTION_STATE,
  type BuilderFormActionState,
} from '@/lib/builder/action-state';
import { createFloorFormAction, updateFloorFormAction } from '@/lib/builder/form-actions';

type FloorFormValues = {
  floorId?: string;
  buildingId?: string;
  name: string;
  level: number;
};

type FloorFormSheetProps = {
  locale: string;
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  values: FloorFormValues;
};

export function FloorFormSheet({ locale, mode, open, onClose, values }: FloorFormSheetProps) {
  const t = useTranslations('portal.floorForm');
  const action =
    mode === 'create'
      ? createFloorFormAction.bind(null, locale)
      : updateFloorFormAction.bind(null, locale);

  const [state, formAction, pending] = useActionState(action, INITIAL_BUILDER_FORM_ACTION_STATE);

  useCloseOnFormSuccess(state, open, onClose);

  return (
    <SideSheet title={t(mode)} open={open} onClose={onClose}>
      <FloorFormBody
        mode={mode}
        values={values}
        state={state}
        formAction={formAction}
        pending={pending}
      />
    </SideSheet>
  );
}

type FloorFormBodyProps = {
  mode: 'create' | 'edit';
  values: FloorFormValues;
  state: BuilderFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function FloorFormBody({ mode, values, state, formAction, pending }: FloorFormBodyProps) {
  const t = useTranslations('portal.floorForm');

  return (
    <form action={formAction} className="portal-form">
      {mode === 'create' && values.buildingId ? (
        <input type="hidden" name="buildingId" value={values.buildingId} />
      ) : null}
      {mode === 'edit' && values.floorId ? (
        <input type="hidden" name="floorId" value={values.floorId} />
      ) : null}

      <PortalFormField label={t('fields.name')} name="name">
        <PortalTextInput
          name="name"
          defaultValue={values.name}
          required
          maxLength={FLOOR_NAME_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.level')} name="level" hint={t('fields.levelHint')}>
        <PortalTextInput name="level" type="number" defaultValue={String(values.level)} required />
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
