'use client';

import type { PublicationStatus } from '@toonexpo/domain';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import {
  INITIAL_ADMIN_CATALOG_ACTION_STATE,
  type AdminCatalogActionState,
} from '@/lib/admin/catalog-action-state';
import { setBankOfferStatusFormAction, setPartnerStatusFormAction } from '@/lib/admin/form-actions';

type PartnerStatusButtonProps = {
  locale: string;
  partnerId: string;
  targetStatus: PublicationStatus;
  actionKey: 'publish' | 'archive' | 'draft';
};

export function PartnerStatusButton({
  locale,
  partnerId,
  targetStatus,
  actionKey,
}: PartnerStatusButtonProps) {
  const t = useTranslations('admin.partners.publication');
  const [state, formAction, pending] = useActionState(
    setPartnerStatusFormAction.bind(null, locale),
    INITIAL_ADMIN_CATALOG_ACTION_STATE,
  );

  return (
    <StatusForm
      entityIdName="partnerId"
      entityId={partnerId}
      targetStatus={targetStatus}
      state={state}
      formAction={formAction}
      pending={pending}
      confirmMessage={t(`confirm.${actionKey}`)}
      label={t(`actions.${actionKey}`)}
    />
  );
}

type BankOfferStatusButtonProps = {
  locale: string;
  partnerId: string;
  bankOfferId: string;
  targetStatus: PublicationStatus;
  actionKey: 'publish' | 'archive' | 'draft';
};

export function BankOfferStatusButton({
  locale,
  partnerId,
  bankOfferId,
  targetStatus,
  actionKey,
}: BankOfferStatusButtonProps) {
  const t = useTranslations('admin.partners.publication');
  const [state, formAction, pending] = useActionState(
    setBankOfferStatusFormAction.bind(null, locale, partnerId),
    INITIAL_ADMIN_CATALOG_ACTION_STATE,
  );

  return (
    <StatusForm
      entityIdName="bankOfferId"
      entityId={bankOfferId}
      targetStatus={targetStatus}
      state={state}
      formAction={formAction}
      pending={pending}
      confirmMessage={t(`confirm.${actionKey}`)}
      label={t(`actions.${actionKey}`)}
    />
  );
}

type StatusFormProps = {
  entityIdName: 'partnerId' | 'bankOfferId';
  entityId: string;
  targetStatus: PublicationStatus;
  state: AdminCatalogActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
  confirmMessage: string;
  label: string;
};

function StatusForm({
  entityIdName,
  entityId,
  targetStatus,
  state,
  formAction,
  pending,
  confirmMessage,
  label,
}: StatusFormProps) {
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
      <input type="hidden" name={entityIdName} value={entityId} />
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
