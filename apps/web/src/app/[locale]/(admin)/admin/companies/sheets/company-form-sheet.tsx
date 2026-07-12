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
import {
  INITIAL_ADMIN_CATALOG_ACTION_STATE,
  type AdminCatalogActionState,
} from '@/lib/admin/catalog-action-state';
import { createCompanyFormAction, updateCompanyFormAction } from '@/lib/admin/form-actions';

type CompanyFormValues = {
  companyId?: string;
  name: string;
  slug?: string;
  description?: string | null;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  city?: string | null;
  address?: string | null;
};

type CompanyFormSheetProps = {
  locale: string;
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  values?: CompanyFormValues;
};

export function CompanyFormSheet({ locale, mode, open, onClose, values }: CompanyFormSheetProps) {
  const t = useTranslations('admin.companies.form');
  const action =
    mode === 'create'
      ? createCompanyFormAction.bind(null, locale)
      : updateCompanyFormAction.bind(null, locale);

  const [state, formAction, pending] = useActionState(action, INITIAL_ADMIN_CATALOG_ACTION_STATE);

  useCloseOnFormSuccess(state, open, onClose);

  return (
    <SideSheet title={t(mode)} open={open} onClose={onClose}>
      <CompanyFormBody
        mode={mode}
        values={values}
        state={state}
        formAction={formAction}
        pending={pending}
      />
    </SideSheet>
  );
}

type CompanyFormBodyProps = {
  mode: 'create' | 'edit';
  values?: CompanyFormValues;
  state: AdminCatalogActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function CompanyFormBody({ mode, values, state, formAction, pending }: CompanyFormBodyProps) {
  const t = useTranslations('admin.companies.form');

  return (
    <form action={formAction} className="portal-form">
      {mode === 'edit' && values?.companyId ? (
        <input type="hidden" name="companyId" value={values.companyId} />
      ) : null}

      <PortalFormField label={t('fields.name')} name="name">
        <PortalTextInput
          name="name"
          defaultValue={values?.name}
          required
          maxLength={COMPANY_NAME_MAX_LENGTH}
        />
      </PortalFormField>

      {mode === 'edit' ? (
        <>
          <PortalFormField label={t('fields.description')} name="description">
            <PortalTextArea
              name="description"
              defaultValue={values?.description ?? undefined}
              maxLength={COMPANY_DESCRIPTION_MAX_LENGTH}
            />
          </PortalFormField>

          <ImageUploadField
            name="logoUrl"
            purpose="COMPANY_LOGO"
            initialUrl={values?.logoUrl ?? ''}
            maxLength={COMPANY_LOGO_URL_MAX_LENGTH}
          />

          <PortalFormField label={t('fields.phone')} name="phone">
            <PortalTextInput
              name="phone"
              defaultValue={values?.phone ?? undefined}
              maxLength={COMPANY_PHONE_MAX_LENGTH}
            />
          </PortalFormField>

          <PortalFormField label={t('fields.email')} name="email">
            <PortalTextInput
              name="email"
              type="email"
              defaultValue={values?.email ?? undefined}
              maxLength={COMPANY_EMAIL_MAX_LENGTH}
            />
          </PortalFormField>

          <PortalFormField label={t('fields.website')} name="website">
            <PortalTextInput
              name="website"
              defaultValue={values?.website ?? undefined}
              maxLength={COMPANY_WEBSITE_MAX_LENGTH}
            />
          </PortalFormField>

          <PortalFormField label={t('fields.city')} name="city">
            <PortalTextInput
              name="city"
              defaultValue={values?.city ?? undefined}
              maxLength={COMPANY_CITY_MAX_LENGTH}
            />
          </PortalFormField>

          <PortalFormField label={t('fields.address')} name="address">
            <PortalTextInput
              name="address"
              defaultValue={values?.address ?? undefined}
              maxLength={COMPANY_ADDRESS_MAX_LENGTH}
            />
          </PortalFormField>
        </>
      ) : null}

      {mode === 'edit' && values?.slug ? (
        <PortalFormField label={t('fields.slug')} name="slug-display" hint={t('fields.slugHint')}>
          <PortalTextInput name="slug-display" defaultValue={values.slug} readOnly />
        </PortalFormField>
      ) : null}

      <PortalFormError errorKey={state.errorKey} namespace="admin.catalog.errors" />

      <div className="portal-form__actions">
        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('submit')}
        </button>
      </div>
    </form>
  );
}
