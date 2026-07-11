'use client';

import {
  CONTACT_EMAIL_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  CONTACT_PHONE_MAX_LENGTH,
  DEAL_MESSAGE_MAX_LENGTH,
} from '@toonexpo/contracts';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';

import { publicRequestFormAction } from '@/app/[locale]/projects/request-actions';
import {
  INITIAL_PUBLIC_REQUEST_FORM_STATE,
  type PublicRequestFormActionState,
} from '@/app/[locale]/projects/request-form-state';
import { PortalFormError } from '@/components/portal-forms/form-error';
import {
  PortalFormField,
  PortalTextArea,
  PortalTextInput,
} from '@/components/portal-forms/form-fields';
import { HONEYPOT_FIELD_NAME } from '@/lib/crm/constants';

type PublicRequestPrefill = {
  name?: string;
  email?: string;
  phone?: string;
};

type PublicRequestSheetProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  apartmentId?: string;
  apartmentCode?: string;
  prefill?: PublicRequestPrefill;
};

export function PublicRequestSheet({
  locale,
  open,
  onClose,
  projectId,
  projectName,
  apartmentId,
  apartmentCode,
  prefill,
}: PublicRequestSheetProps) {
  const t = useTranslations('catalog.request');
  const action = publicRequestFormAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, INITIAL_PUBLIC_REQUEST_FORM_STATE);

  const title = apartmentCode ? t('titleApartment', { code: apartmentCode }) : t('titleProject');
  const contextLabel = apartmentCode
    ? t('contextApartment', { project: projectName, code: apartmentCode })
    : t('contextProject', { project: projectName });

  return (
    <SideSheet title={title} open={open} onClose={onClose}>
      {state.success ? (
        <RequestSuccessView deduped={state.deduped} contextLabel={contextLabel} onClose={onClose} />
      ) : (
        <RequestFormBody
          projectId={projectId}
          apartmentId={apartmentId}
          contextLabel={contextLabel}
          prefill={prefill}
          state={state}
          formAction={formAction}
          pending={pending}
        />
      )}
    </SideSheet>
  );
}

function RequestSuccessView({
  deduped,
  contextLabel,
  onClose,
}: {
  deduped?: boolean;
  contextLabel: string;
  onClose: () => void;
}) {
  const t = useTranslations('catalog.request');

  return (
    <div className="catalog-request-success">
      <p className="catalog-request-success__message">
        {deduped ? t('successDeduped') : t('successNew')}
      </p>
      <p className="catalog-request-success__context">{contextLabel}</p>
      <p className="catalog-request-success__hint">{t('successHint')}</p>
      <div className="portal-form__actions">
        <button type="button" className="portal-btn portal-btn--primary" onClick={onClose}>
          {t('close')}
        </button>
      </div>
    </div>
  );
}

function RequestFormBody({
  projectId,
  apartmentId,
  contextLabel,
  prefill,
  state,
  formAction,
  pending,
}: {
  projectId: string;
  apartmentId?: string;
  contextLabel: string;
  prefill?: PublicRequestPrefill;
  state: PublicRequestFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
}) {
  const t = useTranslations('catalog.request');

  return (
    <form action={formAction} className="portal-form">
      <input type="hidden" name="projectId" value={projectId} />
      {apartmentId ? <input type="hidden" name="apartmentId" value={apartmentId} /> : null}

      <p className="catalog-request-form__context">{contextLabel}</p>

      <PortalFormField label={t('fields.name')} name="name">
        <PortalTextInput
          name="name"
          defaultValue={prefill?.name}
          required
          maxLength={CONTACT_NAME_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.phone')} name="phone">
        <PortalTextInput
          name="phone"
          defaultValue={prefill?.phone}
          required
          maxLength={CONTACT_PHONE_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.email')} name="email">
        <PortalTextInput
          name="email"
          type="email"
          defaultValue={prefill?.email}
          required
          maxLength={CONTACT_EMAIL_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.message')} name="message">
        <PortalTextArea name="message" maxLength={DEAL_MESSAGE_MAX_LENGTH} />
      </PortalFormField>

      <div className="catalog-request-form__honeypot" aria-hidden="true">
        <label htmlFor={HONEYPOT_FIELD_NAME}>Website</label>
        <input
          type="text"
          id={HONEYPOT_FIELD_NAME}
          name={HONEYPOT_FIELD_NAME}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <PortalFormError errorKey={state.errorKey} namespace="catalog.request.errors" />

      <div className="portal-form__actions">
        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('submit')}
        </button>
      </div>
    </form>
  );
}

type ProjectRequestCtaProps = {
  locale: string;
  projectId: string;
  projectName: string;
  prefill?: PublicRequestPrefill;
};

export function ProjectRequestCta({
  locale,
  projectId,
  projectName,
  prefill,
}: ProjectRequestCtaProps) {
  const t = useTranslations('catalog.request');
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="portal-btn portal-btn--primary"
        onClick={() => setOpen(true)}
      >
        {t('ctaProject')}
      </button>
      <PublicRequestSheet
        locale={locale}
        open={open}
        onClose={() => setOpen(false)}
        projectId={projectId}
        projectName={projectName}
        prefill={prefill}
      />
    </>
  );
}

type ApartmentRequestButtonProps = {
  locale: string;
  projectId: string;
  projectName: string;
  apartmentId: string;
  apartmentCode: string;
  prefill?: PublicRequestPrefill;
};

export function ApartmentRequestButton({
  locale,
  projectId,
  projectName,
  apartmentId,
  apartmentCode,
  prefill,
}: ApartmentRequestButtonProps) {
  const t = useTranslations('catalog.request');
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="catalog-request-btn" onClick={() => setOpen(true)}>
        {t('ctaApartment')}
      </button>
      <PublicRequestSheet
        locale={locale}
        open={open}
        onClose={() => setOpen(false)}
        projectId={projectId}
        projectName={projectName}
        apartmentId={apartmentId}
        apartmentCode={apartmentCode}
        prefill={prefill}
      />
    </>
  );
}
