'use client';

import {
  COMPANY_ADDRESS_MAX_LENGTH,
  COMPANY_CITY_MAX_LENGTH,
  COMPANY_DESCRIPTION_MAX_LENGTH,
  COMPANY_EMAIL_MAX_LENGTH,
  COMPANY_LOGO_URL_MAX_LENGTH,
  COMPANY_NAME_MAX_LENGTH,
  COMPANY_PHONE_MAX_LENGTH,
  COMPANY_WEBSITE_MAX_LENGTH,
} from '@toonexpo/contracts';
import type { PublicCompanyProfile } from '@toonexpo/contracts';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import {
  PortalFormField,
  PortalTextArea,
  PortalTextInput,
} from '@/components/portal-forms/form-fields';
import { useCloseOnFormSuccess } from '@/components/portal-forms/use-close-on-form-success';
import { INITIAL_BUILDER_FORM_ACTION_STATE } from '@/lib/builder/action-state';
import { updateCompanyProfileFormAction } from '@/lib/builder/form-actions';

type CompanyProfileFormSheetProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  profile: PublicCompanyProfile;
};

export function CompanyProfileFormSheet({
  locale,
  open,
  onClose,
  profile,
}: CompanyProfileFormSheetProps) {
  const t = useTranslations('portal.company.form');
  const action = updateCompanyProfileFormAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, INITIAL_BUILDER_FORM_ACTION_STATE);

  useCloseOnFormSuccess(state, open, onClose);

  return (
    <SideSheet title={t('title')} open={open} onClose={onClose}>
      <form action={formAction} className="portal-form">
        <PortalFormField label={t('fields.name')} name="name">
          <PortalTextInput
            name="name"
            defaultValue={profile.name}
            required
            maxLength={COMPANY_NAME_MAX_LENGTH}
          />
        </PortalFormField>

        <PortalFormField label={t('fields.description')} name="description">
          <PortalTextArea
            name="description"
            defaultValue={profile.description ?? undefined}
            maxLength={COMPANY_DESCRIPTION_MAX_LENGTH}
          />
        </PortalFormField>

        <PortalFormField label={t('fields.logoUrl')} name="logoUrl">
          <PortalTextInput
            name="logoUrl"
            defaultValue={profile.logoUrl ?? undefined}
            maxLength={COMPANY_LOGO_URL_MAX_LENGTH}
          />
        </PortalFormField>

        <PortalFormField label={t('fields.phone')} name="phone">
          <PortalTextInput
            name="phone"
            defaultValue={profile.phone ?? undefined}
            maxLength={COMPANY_PHONE_MAX_LENGTH}
          />
        </PortalFormField>

        <PortalFormField label={t('fields.email')} name="email">
          <PortalTextInput
            name="email"
            type="email"
            defaultValue={profile.email ?? undefined}
            maxLength={COMPANY_EMAIL_MAX_LENGTH}
          />
        </PortalFormField>

        <PortalFormField label={t('fields.website')} name="website">
          <PortalTextInput
            name="website"
            defaultValue={profile.website ?? undefined}
            maxLength={COMPANY_WEBSITE_MAX_LENGTH}
          />
        </PortalFormField>

        <PortalFormField label={t('fields.city')} name="city">
          <PortalTextInput
            name="city"
            defaultValue={profile.city ?? undefined}
            maxLength={COMPANY_CITY_MAX_LENGTH}
          />
        </PortalFormField>

        <PortalFormField label={t('fields.address')} name="address">
          <PortalTextInput
            name="address"
            defaultValue={profile.address ?? undefined}
            maxLength={COMPANY_ADDRESS_MAX_LENGTH}
          />
        </PortalFormField>

        <PortalFormError errorKey={state.errorKey} namespace="portal.errors" />

        <div className="portal-form__actions">
          <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
            {t('submit')}
          </button>
        </div>
      </form>
    </SideSheet>
  );
}
