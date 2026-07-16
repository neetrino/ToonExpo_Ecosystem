'use client';

import { BUILDING_DESCRIPTION_MAX_LENGTH, BUILDING_NAME_MAX_LENGTH } from '@toonexpo/contracts';
import type { PublicationStatus } from '@toonexpo/domain';
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
import { createBuildingFormAction, updateBuildingFormAction } from '@/lib/builder/form-actions';
import { STATUS_BADGE_CLASS } from '@/lib/shared/publication';

import { InventoryPublicationActions } from '../inventory-publication-actions';

type BuildingFormValues = {
  buildingId?: string;
  projectId?: string;
  name: string;
  description?: string | null;
  status?: PublicationStatus;
};

type BuildingFormSheetProps = {
  locale: string;
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  values: BuildingFormValues;
  statusLabel?: string;
};

export function BuildingFormSheet({
  locale,
  mode,
  open,
  onClose,
  values,
  statusLabel,
}: BuildingFormSheetProps) {
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
        locale={locale}
        mode={mode}
        values={values}
        statusLabel={statusLabel}
        state={state}
        formAction={formAction}
        pending={pending}
      />
    </SideSheet>
  );
}

type BuildingFormBodyProps = {
  locale: string;
  mode: 'create' | 'edit';
  values: BuildingFormValues;
  statusLabel?: string;
  state: BuilderFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function BuildingFormBody({
  locale,
  mode,
  values,
  statusLabel,
  state,
  formAction,
  pending,
}: BuildingFormBodyProps) {
  const t = useTranslations('portal.buildingForm');
  const tPublication = useTranslations('portal.inventoryPublication');

  return (
    <form action={formAction} className="portal-form">
      {mode === 'create' && values.projectId ? (
        <input type="hidden" name="projectId" value={values.projectId} />
      ) : null}
      {mode === 'edit' && values.buildingId ? (
        <input type="hidden" name="buildingId" value={values.buildingId} />
      ) : null}

      {mode === 'edit' && values.status && statusLabel ? (
        <div className="portal-form__meta">
          <span className={STATUS_BADGE_CLASS[values.status]}>{statusLabel}</span>
          <InventoryPublicationActions
            locale={locale}
            entityKind="building"
            entityId={values.buildingId ?? ''}
            status={values.status}
            labels={{
              publish: tPublication('actions.publish'),
              archive: tPublication('actions.archive'),
              draft: tPublication('actions.draft'),
              confirm: {
                publish: tPublication('confirm.building.publish'),
                archive: tPublication('confirm.building.archive'),
                draft: tPublication('confirm.building.draft'),
              },
            }}
          />
        </div>
      ) : null}

      <PortalFormField label={t('fields.name')} name="name">
        <PortalTextInput
          name="name"
          defaultValue={values.name}
          required
          maxLength={BUILDING_NAME_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.description')} name="description">
        <PortalTextArea
          name="description"
          defaultValue={values.description ?? undefined}
          maxLength={BUILDING_DESCRIPTION_MAX_LENGTH}
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
