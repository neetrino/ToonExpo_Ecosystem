'use client';

import type { PublicationStatus } from '@toonexpo/domain';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '../_shared/form-error';

import {
  INITIAL_BUILDER_FORM_ACTION_STATE,
  type BuilderFormActionState,
} from '@/lib/builder/action-state';
import { setProjectPublicationFormAction } from '@/lib/builder/form-actions';

type PublicationActionButtonProps = {
  locale: string;
  projectId: string;
  targetStatus: PublicationStatus;
  actionKey: 'publish' | 'archive' | 'draft';
};

export function PublicationActionButton({
  locale,
  projectId,
  targetStatus,
  actionKey,
}: PublicationActionButtonProps) {
  const t = useTranslations('portal.publication');
  const [state, formAction, pending] = useActionState(
    setProjectPublicationFormAction.bind(null, locale),
    INITIAL_BUILDER_FORM_ACTION_STATE,
  );

  return (
    <PublicationForm
      projectId={projectId}
      targetStatus={targetStatus}
      actionKey={actionKey}
      state={state}
      formAction={formAction}
      pending={pending}
      confirmMessage={t(`confirm.${actionKey}`)}
      label={t(`actions.${actionKey}`)}
    />
  );
}

type PublicationFormProps = {
  projectId: string;
  targetStatus: PublicationStatus;
  actionKey: 'publish' | 'archive' | 'draft';
  state: BuilderFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
  confirmMessage: string;
  label: string;
};

function PublicationForm({
  projectId,
  targetStatus,
  state,
  formAction,
  pending,
  confirmMessage,
  label,
}: PublicationFormProps) {
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
      <input type="hidden" name="projectId" value={projectId} />
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
