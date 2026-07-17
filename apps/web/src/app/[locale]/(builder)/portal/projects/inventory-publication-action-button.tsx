'use client';

import type { PublicationStatus } from '@toonexpo/domain';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import { useRefreshOnFormSuccess } from '@/components/portal-forms/use-refresh-on-form-success';

import {
  INITIAL_BUILDER_FORM_ACTION_STATE,
  type BuilderFormActionState,
} from '@/lib/builder/action-state';
import {
  setBuildingPublicationFormAction,
  setFloorPublicationFormAction,
} from '@/lib/builder/form-actions';

type InventoryPublicationActionButtonProps = {
  locale: string;
  entityKind: 'building' | 'floor';
  entityId: string;
  targetStatus: PublicationStatus;
  actionKey: 'publish' | 'archive' | 'draft';
  confirmMessage: string;
  label: string;
};

export function InventoryPublicationActionButton({
  locale,
  entityKind,
  entityId,
  targetStatus,
  confirmMessage,
  label,
}: InventoryPublicationActionButtonProps) {
  const formActionFactory =
    entityKind === 'building'
      ? setBuildingPublicationFormAction.bind(null, locale)
      : setFloorPublicationFormAction.bind(null, locale);

  const [state, formAction, pending] = useActionState(
    formActionFactory,
    INITIAL_BUILDER_FORM_ACTION_STATE,
  );
  useRefreshOnFormSuccess(state, true);

  return (
    <InventoryPublicationForm
      entityKind={entityKind}
      entityId={entityId}
      targetStatus={targetStatus}
      confirmMessage={confirmMessage}
      label={label}
      state={state}
      formAction={formAction}
      pending={pending}
    />
  );
}

type InventoryPublicationFormProps = {
  entityKind: 'building' | 'floor';
  entityId: string;
  targetStatus: PublicationStatus;
  confirmMessage: string;
  label: string;
  state: BuilderFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function InventoryPublicationForm({
  entityKind,
  entityId,
  targetStatus,
  confirmMessage,
  label,
  state,
  formAction,
  pending,
}: InventoryPublicationFormProps) {
  const idField = entityKind === 'building' ? 'buildingId' : 'floorId';

  return (
    <form
      action={formAction}
      className="portal-publication-form"
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name={idField} value={entityId} />
      <input type="hidden" name="status" value={targetStatus} />
      <button
        type="submit"
        className="portal-btn portal-btn--ghost portal-btn--sm"
        disabled={pending}
      >
        {label}
      </button>
      <PortalFormError errorKey={state.errorKey} />
    </form>
  );
}
