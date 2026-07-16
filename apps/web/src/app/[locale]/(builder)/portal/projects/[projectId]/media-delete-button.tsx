'use client';

import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';

import {
  INITIAL_BUILDER_FORM_ACTION_STATE,
  type BuilderFormActionState,
} from '@/lib/builder/action-state';
import { deleteMediaAssetFormAction } from '@/lib/builder/form-actions';

type MediaDeleteButtonProps = {
  locale: string;
  mediaAssetId: string;
  confirmMessage: string;
  label: string;
};

export function MediaDeleteButton({
  locale,
  mediaAssetId,
  confirmMessage,
  label,
}: MediaDeleteButtonProps) {
  const [state, formAction, pending] = useActionState(
    deleteMediaAssetFormAction.bind(null, locale),
    INITIAL_BUILDER_FORM_ACTION_STATE,
  );

  return (
    <DeleteMediaForm
      mediaAssetId={mediaAssetId}
      confirmMessage={confirmMessage}
      label={label}
      state={state}
      formAction={formAction}
      pending={pending}
    />
  );
}

type DeleteMediaFormProps = {
  mediaAssetId: string;
  confirmMessage: string;
  label: string;
  state: BuilderFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function DeleteMediaForm({
  mediaAssetId,
  confirmMessage,
  label,
  state,
  formAction,
  pending,
}: DeleteMediaFormProps) {
  return (
    <form
      action={formAction}
      className="portal-media-delete-form"
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="mediaAssetId" value={mediaAssetId} />
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
