'use client';

import {
  PARTNER_DESCRIPTION_MAX_LENGTH,
  PARTNER_EMAIL_MAX_LENGTH,
  PARTNER_LOGO_URL_MAX_LENGTH,
  PARTNER_NAME_MAX_LENGTH,
  PARTNER_PHONE_MAX_LENGTH,
  PARTNER_WEBSITE_MAX_LENGTH,
} from '@toonexpo/contracts';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import {
  PortalFormField,
  PortalTextArea,
  PortalTextInput,
} from '@/components/portal-forms/form-fields';
import { ImageUploadField } from '@/components/portal-forms/image-upload-field';
import { useCloseOnFormSuccess } from '@/components/portal-forms/use-close-on-form-success';
import type { PartnerSessionPartner } from '@/lib/partner/assert-partner-session';
import {
  INITIAL_PARTNER_FORM_ACTION_STATE,
  type PartnerFormActionState,
} from '@/lib/partner/action-state';
import { updateOwnPartnerProfileFormAction } from '@/lib/partner/form-actions';

type PartnerProfileFormSheetProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  partner: PartnerSessionPartner;
};

export function PartnerProfileFormSheet({
  locale,
  open,
  onClose,
  partner,
}: PartnerProfileFormSheetProps) {
  const t = useTranslations('partnerCabinet.profile.form');
  const action = updateOwnPartnerProfileFormAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, INITIAL_PARTNER_FORM_ACTION_STATE);

  useCloseOnFormSuccess(state, open, onClose);

  return (
    <SideSheet title={t('title')} open={open} onClose={onClose}>
      <PartnerProfileFormBody
        partner={partner}
        state={state}
        formAction={formAction}
        pending={pending}
      />
    </SideSheet>
  );
}

type PartnerProfileFormBodyProps = {
  partner: PartnerSessionPartner;
  state: PartnerFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function PartnerProfileFormBody({
  partner,
  state,
  formAction,
  pending,
}: PartnerProfileFormBodyProps) {
  const t = useTranslations('partnerCabinet.profile.form');
  const showServices = partner.type === 'SERVICE_COMPANY';

  return (
    <form action={formAction} className="portal-form">
      <PortalFormField label={t('fields.name')} name="name">
        <PortalTextInput
          name="name"
          defaultValue={partner.name}
          required
          maxLength={PARTNER_NAME_MAX_LENGTH}
        />
      </PortalFormField>

      <ImageUploadField
        name="logoUrl"
        purpose="COMPANY_LOGO"
        initialUrl={partner.logoUrl ?? ''}
        maxLength={PARTNER_LOGO_URL_MAX_LENGTH}
      />

      <PortalFormField label={t('fields.description')} name="description">
        <PortalTextArea
          name="description"
          defaultValue={partner.description ?? undefined}
          maxLength={PARTNER_DESCRIPTION_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.phone')} name="phone">
        <PortalTextInput
          name="phone"
          defaultValue={partner.phone ?? undefined}
          maxLength={PARTNER_PHONE_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.email')} name="email">
        <PortalTextInput
          name="email"
          type="email"
          defaultValue={partner.email ?? undefined}
          maxLength={PARTNER_EMAIL_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.website')} name="website">
        <PortalTextInput
          name="website"
          defaultValue={partner.website ?? undefined}
          maxLength={PARTNER_WEBSITE_MAX_LENGTH}
        />
      </PortalFormField>

      {showServices ? (
        <PortalFormField
          label={t('fields.serviceCategories')}
          name="serviceCategories"
          hint={t('fields.serviceCategoriesHint')}
        >
          <PortalTextInput
            name="serviceCategories"
            defaultValue={partner.serviceCategories.join(', ') || undefined}
          />
        </PortalFormField>
      ) : null}

      <PortalFormError errorKey={state.errorKey} namespace="partnerCabinet.errors" />

      <div className="portal-form__actions">
        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('submit')}
        </button>
      </div>
    </form>
  );
}
