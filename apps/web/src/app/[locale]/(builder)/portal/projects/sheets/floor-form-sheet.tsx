'use client';

import { FLOOR_NAME_MAX_LENGTH } from '@toonexpo/contracts';
import type { PublicationStatus } from '@toonexpo/domain';
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
import { createFloorFormAction, updateFloorFormAction } from '@/lib/builder/form-actions';
import { STATUS_BADGE_CLASS } from '@/lib/shared/publication';

import { InventoryPublicationActions } from '../inventory-publication-actions';

type FloorFormValues = {
  floorId?: string;
  buildingId?: string;
  name: string;
  level: number;
  status?: PublicationStatus;
};

type FloorFormSheetProps = {
  locale: string;
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  values: FloorFormValues;
  statusLabel?: string;
};

export function FloorFormSheet({
  locale,
  mode,
  open,
  onClose,
  values,
  statusLabel,
}: FloorFormSheetProps) {
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

type FloorFormBodyProps = {
  locale: string;
  mode: 'create' | 'edit';
  values: FloorFormValues;
  statusLabel?: string;
  state: BuilderFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function FloorFormBody({
  locale,
  mode,
  values,
  statusLabel,
  state,
  formAction,
  pending,
}: FloorFormBodyProps) {
  const t = useTranslations('portal.floorForm');
  const tPublication = useTranslations('portal.inventoryPublication');

  return (
    <form action={formAction} className="portal-form">
      {mode === 'create' && values.buildingId ? (
        <input type="hidden" name="buildingId" value={values.buildingId} />
      ) : null}
      {mode === 'edit' && values.floorId ? (
        <input type="hidden" name="floorId" value={values.floorId} />
      ) : null}

      {mode === 'edit' && values.status && statusLabel ? (
        <div className="portal-form__meta">
          <span className={STATUS_BADGE_CLASS[values.status]}>{statusLabel}</span>
          <InventoryPublicationActions
            locale={locale}
            entityKind="floor"
            entityId={values.floorId ?? ''}
            status={values.status}
            labels={{
              publish: tPublication('actions.publish'),
              archive: tPublication('actions.archive'),
              draft: tPublication('actions.draft'),
              confirm: {
                publish: tPublication('confirm.floor.publish'),
                archive: tPublication('confirm.floor.archive'),
                draft: tPublication('confirm.floor.draft'),
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
