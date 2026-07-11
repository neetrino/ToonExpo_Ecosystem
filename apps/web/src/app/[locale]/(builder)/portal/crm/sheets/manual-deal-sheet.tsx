'use client';

import {
  CONTACT_EMAIL_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  CONTACT_PHONE_MAX_LENGTH,
  DEAL_MESSAGE_MAX_LENGTH,
} from '@toonexpo/contracts';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import {
  PortalFormField,
  PortalSelect,
  PortalTextArea,
  PortalTextInput,
} from '@/components/portal-forms/form-fields';
import { useCloseOnFormSuccess } from '@/components/portal-forms/use-close-on-form-success';
import { INITIAL_CRM_FORM_ACTION_STATE, type CrmFormActionState } from '@/lib/crm/action-state';
import { createManualDealFormAction } from '@/lib/crm/form-actions';

type ManualDealProjectOption = {
  id: string;
  name: string;
};

type ManualDealSheetProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  projects: ManualDealProjectOption[];
  onCreated?: (dealId: string) => void;
};

export function ManualDealSheet({
  locale,
  open,
  onClose,
  projects,
  onCreated,
}: ManualDealSheetProps) {
  const t = useTranslations('portal.crm.manualDeal');
  const action = createManualDealFormAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, INITIAL_CRM_FORM_ACTION_STATE);

  useCloseOnFormSuccess(state, open, onClose);

  useEffect(() => {
    if (!state.success || !state.dealId || !onCreated) {
      return;
    }
    onCreated(state.dealId);
  }, [onCreated, state.dealId, state.success]);

  return (
    <SideSheet title={t('title')} open={open} onClose={onClose}>
      <ManualDealForm projects={projects} state={state} formAction={formAction} pending={pending} />
    </SideSheet>
  );
}

type ManualDealFormProps = {
  projects: ManualDealProjectOption[];
  state: CrmFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function ManualDealForm({ projects, state, formAction, pending }: ManualDealFormProps) {
  const t = useTranslations('portal.crm.manualDeal');

  return (
    <form action={formAction} className="portal-form">
      <PortalFormField label={t('fields.contactName')} name="contactName">
        <PortalTextInput name="contactName" required maxLength={CONTACT_NAME_MAX_LENGTH} />
      </PortalFormField>

      <PortalFormField label={t('fields.contactPhone')} name="contactPhone">
        <PortalTextInput name="contactPhone" required maxLength={CONTACT_PHONE_MAX_LENGTH} />
      </PortalFormField>

      <PortalFormField label={t('fields.contactEmail')} name="contactEmail">
        <PortalTextInput name="contactEmail" type="email" maxLength={CONTACT_EMAIL_MAX_LENGTH} />
      </PortalFormField>

      <PortalFormField label={t('fields.message')} name="message">
        <PortalTextArea name="message" maxLength={DEAL_MESSAGE_MAX_LENGTH} />
      </PortalFormField>

      {projects.length > 0 ? (
        <PortalFormField label={t('fields.project')} name="projectId">
          <PortalSelect name="projectId">
            <option value="">{t('fields.noProject')}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </PortalSelect>
        </PortalFormField>
      ) : null}

      <PortalFormError errorKey={state.errorKey} namespace="portal.crm.errors" />

      <div className="portal-form__actions">
        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('submit')}
        </button>
      </div>
    </form>
  );
}
