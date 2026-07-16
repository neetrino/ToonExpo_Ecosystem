'use client';

import {
  PARTNER_DESCRIPTION_MAX_LENGTH,
  PARTNER_EMAIL_MAX_LENGTH,
  PARTNER_LOGO_URL_MAX_LENGTH,
  PARTNER_NAME_MAX_LENGTH,
  PARTNER_PHONE_MAX_LENGTH,
  PARTNER_WEBSITE_MAX_LENGTH,
} from '@toonexpo/contracts';
import type { PartnerType } from '@toonexpo/domain';
import { PARTNER_TYPES } from '@toonexpo/domain';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import {
  PortalFormField,
  PortalSelect,
  PortalTextArea,
  PortalTextInput,
} from '@/components/portal-forms/form-fields';
import { ImageUploadField } from '@/components/portal-forms/image-upload-field';
import { useCloseOnFormSuccess } from '@/components/portal-forms/use-close-on-form-success';
import {
  INITIAL_ADMIN_CATALOG_ACTION_STATE,
  type AdminCatalogActionState,
} from '@/lib/admin/catalog-action-state';
import { createPartnerFormAction, updatePartnerFormAction } from '@/lib/admin/form-actions';

type PartnerFormValues = {
  partnerId?: string;
  name: string;
  type: PartnerType;
  slug?: string;
  logoUrl?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  serviceCategories?: string[];
};

type PartnerFormSheetProps = {
  locale: string;
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  values?: PartnerFormValues;
};

export function PartnerFormSheet({ locale, mode, open, onClose, values }: PartnerFormSheetProps) {
  const t = useTranslations('admin.partners.form');
  const action =
    mode === 'create'
      ? createPartnerFormAction.bind(null, locale)
      : updatePartnerFormAction.bind(null, locale);

  const [state, formAction, pending] = useActionState(action, INITIAL_ADMIN_CATALOG_ACTION_STATE);

  useCloseOnFormSuccess(state, open, onClose);

  return (
    <SideSheet title={t(mode)} open={open} onClose={onClose}>
      <PartnerFormBody
        mode={mode}
        values={values}
        state={state}
        formAction={formAction}
        pending={pending}
      />
    </SideSheet>
  );
}

type PartnerFormBodyProps = {
  mode: 'create' | 'edit';
  values?: PartnerFormValues;
  state: AdminCatalogActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function PartnerFormBody({ mode, values, state, formAction, pending }: PartnerFormBodyProps) {
  const t = useTranslations('admin.partners.form');
  const tTypes = useTranslations('admin.partners.types');

  return (
    <form action={formAction} className="portal-form">
      {mode === 'edit' && values?.partnerId ? (
        <input type="hidden" name="partnerId" value={values.partnerId} />
      ) : null}

      <PortalFormField label={t('fields.name')} name="name">
        <PortalTextInput
          name="name"
          defaultValue={values?.name}
          required
          maxLength={PARTNER_NAME_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.type')} name="type">
        <PortalSelect name="type" defaultValue={values?.type ?? 'OTHER'} required>
          {PARTNER_TYPES.map((type) => (
            <option key={type} value={type}>
              {tTypes(type)}
            </option>
          ))}
        </PortalSelect>
      </PortalFormField>

      {mode === 'edit' && values?.slug ? (
        <PortalFormField label={t('fields.slug')} name="slug-display" hint={t('fields.slugHint')}>
          <PortalTextInput name="slug-display" defaultValue={values.slug} readOnly />
        </PortalFormField>
      ) : null}

      <ImageUploadField
        name="logoUrl"
        purpose="COMPANY_LOGO"
        initialUrl={values?.logoUrl ?? ''}
        maxLength={PARTNER_LOGO_URL_MAX_LENGTH}
      />

      <PortalFormField label={t('fields.description')} name="description">
        <PortalTextArea
          name="description"
          defaultValue={values?.description ?? undefined}
          maxLength={PARTNER_DESCRIPTION_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.phone')} name="phone">
        <PortalTextInput
          name="phone"
          defaultValue={values?.phone ?? undefined}
          maxLength={PARTNER_PHONE_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.email')} name="email">
        <PortalTextInput
          name="email"
          type="email"
          defaultValue={values?.email ?? undefined}
          maxLength={PARTNER_EMAIL_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.website')} name="website">
        <PortalTextInput
          name="website"
          defaultValue={values?.website ?? undefined}
          maxLength={PARTNER_WEBSITE_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField
        label={t('fields.serviceCategories')}
        name="serviceCategories"
        hint={t('fields.serviceCategoriesHint')}
      >
        <PortalTextInput
          name="serviceCategories"
          defaultValue={values?.serviceCategories?.join(', ') ?? undefined}
        />
      </PortalFormField>

      <PortalFormError errorKey={state.errorKey} namespace="admin.catalog.errors" />

      <div className="portal-form__actions">
        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('submit')}
        </button>
      </div>
    </form>
  );
}
