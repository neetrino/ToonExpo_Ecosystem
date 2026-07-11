'use client';

import { DEAL_MESSAGE_MAX_LENGTH } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import {
  PortalFormField,
  PortalSelect,
  PortalTextArea,
} from '@/components/portal-forms/form-fields';

import { createScanDealAction } from './actions';
import { INITIAL_BUILDER_SCAN_FORM_STATE, type BuilderScanFormState } from './scan-form-state';

type ProjectOption = {
  id: string;
  name: string;
};

type BuilderScanFormProps = {
  locale: string;
  qrToken: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  projects: ProjectOption[];
};

export function BuilderScanForm({
  locale,
  qrToken,
  buyerName,
  buyerEmail,
  buyerPhone,
  projects,
}: BuilderScanFormProps) {
  const t = useTranslations('qr.builder');
  const action = createScanDealAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, INITIAL_BUILDER_SCAN_FORM_STATE);

  if ('success' in state && state.success) {
    return (
      <div className="qr-scan-success">
        <p className="qr-scan-success__message">
          {state.deduped ? t('successDeduped') : t('successNew')}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="portal-form qr-scan-form">
      <input type="hidden" name="qrToken" value={qrToken} />

      <dl className="qr-scan-buyer">
        <div>
          <dt>{t('fields.name')}</dt>
          <dd>{buyerName}</dd>
        </div>
        <div>
          <dt>{t('fields.email')}</dt>
          <dd>{buyerEmail}</dd>
        </div>
        <div>
          <dt>{t('fields.phone')}</dt>
          <dd>{buyerPhone}</dd>
        </div>
      </dl>

      <PortalFormField label={t('fields.project')} name="projectId" hint={t('fields.projectHint')}>
        <PortalSelect name="projectId">
          <option value="">{t('fields.projectNone')}</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </PortalSelect>
      </PortalFormField>

      <PortalFormField label={t('fields.note')} name="note">
        <PortalTextArea name="note" maxLength={DEAL_MESSAGE_MAX_LENGTH} />
      </PortalFormField>

      <PortalFormError errorKey={getErrorKey(state)} namespace="qr.builder.errors" />

      <div className="portal-form__actions">
        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('submit')}
        </button>
      </div>
    </form>
  );
}

function getErrorKey(state: BuilderScanFormState): string | undefined {
  if ('errorKey' in state) {
    return state.errorKey;
  }
  return undefined;
}
