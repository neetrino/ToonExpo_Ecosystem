'use client';

import type { PublicationStatus } from '@toonexpo/domain';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import { useRefreshOnFormSuccess } from '@/components/portal-forms/use-refresh-on-form-success';
import {
  INITIAL_ADMIN_CATALOG_ACTION_STATE,
  type AdminCatalogActionState,
} from '@/lib/admin/catalog-action-state';
import { setProjectPublicationAsAdminFormAction } from '@/lib/admin/form-actions';

type AdminPublicationActionButtonProps = {
  locale: string;
  projectId: string;
  targetStatus: PublicationStatus;
  actionKey: 'publish' | 'archive' | 'draft';
};

export function AdminPublicationActionButton({
  locale,
  projectId,
  targetStatus,
  actionKey,
}: AdminPublicationActionButtonProps) {
  const t = useTranslations('admin.publication');
  const [state, formAction, pending] = useActionState(
    setProjectPublicationAsAdminFormAction.bind(null, locale),
    INITIAL_ADMIN_CATALOG_ACTION_STATE,
  );
  useRefreshOnFormSuccess(state, true);

  return (
    <PublicationForm
      projectId={projectId}
      targetStatus={targetStatus}
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
  state: AdminCatalogActionState;
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
      <PortalFormError errorKey={state.errorKey} namespace="admin.catalog.errors" />
    </form>
  );
}
