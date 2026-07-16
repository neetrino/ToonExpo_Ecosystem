'use client';

import { BUYER_PROFILE_NAME_MAX_LENGTH, BUYER_PROFILE_PHONE_MAX_LENGTH } from '@toonexpo/contracts';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import { PortalFormField, PortalTextInput } from '@/components/portal-forms/form-fields';
import { useCloseOnFormSuccess } from '@/components/portal-forms/use-close-on-form-success';
import type { BuyerProfileView } from '@/lib/buyer/profile-mutations';
import {
  INITIAL_BUYER_PROFILE_FORM_ACTION_STATE,
  updateBuyerProfileFormAction,
} from '@/lib/buyer/form-actions';

type BuyerProfileSectionProps = {
  locale: string;
  profile: BuyerProfileView;
};

export function BuyerProfileSection({ locale, profile }: BuyerProfileSectionProps) {
  const t = useTranslations('buyer.account.profile');
  const [open, setOpen] = useState(false);

  return (
    <section className="buyer-account__profile" aria-labelledby="buyer-profile-heading">
      <div className="buyer-account__profile-header">
        <h2 id="buyer-profile-heading" className="buyer-account__section-title">
          {t('title')}
        </h2>
        <button
          type="button"
          className="portal-btn portal-btn--ghost portal-btn--sm"
          onClick={() => setOpen(true)}
        >
          {t('edit')}
        </button>
      </div>

      <dl className="buyer-account__profile-fields">
        <div>
          <dt>{t('fields.name')}</dt>
          <dd>{profile.name ?? t('noValue')}</dd>
        </div>
        <div>
          <dt>{t('fields.email')}</dt>
          <dd>{profile.email}</dd>
        </div>
        <div>
          <dt>{t('fields.phone')}</dt>
          <dd>{profile.phone ?? t('noValue')}</dd>
        </div>
      </dl>
      <p className="buyer-account__profile-note">{t('emailReadOnlyNote')}</p>

      <BuyerProfileEditSheet
        locale={locale}
        open={open}
        onClose={() => setOpen(false)}
        profile={profile}
      />
    </section>
  );
}

function BuyerProfileEditSheet({
  locale,
  open,
  onClose,
  profile,
}: {
  locale: string;
  open: boolean;
  onClose: () => void;
  profile: BuyerProfileView;
}) {
  const t = useTranslations('buyer.account.profile');
  const action = updateBuyerProfileFormAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_BUYER_PROFILE_FORM_ACTION_STATE,
  );

  useCloseOnFormSuccess(state, open, onClose);

  return (
    <SideSheet title={t('editTitle')} open={open} onClose={onClose}>
      <form action={formAction} className="portal-form">
        <PortalFormField label={t('fields.name')} name="name">
          <PortalTextInput
            name="name"
            defaultValue={profile.name ?? ''}
            required
            maxLength={BUYER_PROFILE_NAME_MAX_LENGTH}
          />
        </PortalFormField>

        <PortalFormField label={t('fields.email')} name="email">
          <PortalTextInput name="email" defaultValue={profile.email} readOnly />
        </PortalFormField>

        <PortalFormField label={t('fields.phone')} name="phone">
          <PortalTextInput
            name="phone"
            defaultValue={profile.phone ?? ''}
            maxLength={BUYER_PROFILE_PHONE_MAX_LENGTH}
          />
        </PortalFormField>

        <PortalFormError errorKey={state.errorKey} namespace="buyer.account.profile.errors" />

        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('save')}
        </button>
      </form>
    </SideSheet>
  );
}
