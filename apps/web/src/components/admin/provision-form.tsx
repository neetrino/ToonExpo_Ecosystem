'use client';

import { PROVISIONABLE_ROLES } from '@toonexpo/contracts';
import type { PartnerType } from '@toonexpo/domain';
import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';

import {
  INITIAL_PROVISION_ACTION_STATE,
  type ProvisionActionState,
} from '@/lib/admin/action-state';
import { TeButton } from '@/components/ui/te-button';

type PartnerOption = {
  id: string;
  name: string;
  type: PartnerType;
};

type ProvisionFormProps = {
  action: (state: ProvisionActionState, formData: FormData) => Promise<ProvisionActionState>;
  partners: PartnerOption[];
};

export function ProvisionForm({ action, partners }: ProvisionFormProps) {
  const t = useTranslations('admin.provision');
  const tRoles = useTranslations('admin.users.roles');
  const tTypes = useTranslations('admin.partners.types');
  const [state, formAction, pending] = useActionState(action, INITIAL_PROVISION_ACTION_STATE);
  const [role, setRole] = useState<string>('BUILDER');

  return (
    <form
      action={formAction}
      data-testid="provision-account-form"
      className="portal-card portal-form"
    >
      <h2 className="portal-card__title">{t('title')}</h2>
      <p className="portal-muted">{t('description')}</p>

      <label className="portal-form__field">
        <span className="portal-form__label">{t('fields.email')}</span>
        <input className="portal-form__input" type="email" name="email" autoComplete="off" required />
      </label>

      <label className="portal-form__field">
        <span className="portal-form__label">{t('fields.name')}</span>
        <input className="portal-form__input" type="text" name="name" autoComplete="off" required />
      </label>

      <label className="portal-form__field">
        <span className="portal-form__label">{t('fields.role')}</span>
        <select
          className="portal-form__select"
          name="role"
          required
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          {PROVISIONABLE_ROLES.map((option) => (
            <option key={option} value={option}>
              {tRoles(option)}
            </option>
          ))}
        </select>
      </label>

      <label className="portal-form__field">
        <span className="portal-form__label">{t('fields.companyName')}</span>
        <input className="portal-form__input" type="text" name="companyName" autoComplete="off" />
        <span className="portal-form__hint">{t('fields.companyNameHint')}</span>
      </label>

      {role === 'PARTNER' ? (
        <label className="portal-form__field">
          <span className="portal-form__label">{t('fields.partnerId')}</span>
          <select className="portal-form__select" name="partnerId" defaultValue="">
            <option value="">{t('fields.partnerIdNone')}</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name} ({tTypes(partner.type)})
              </option>
            ))}
          </select>
          <span className="portal-form__hint">{t('fields.partnerIdHint')}</span>
        </label>
      ) : null}

      {state.errorKey ? (
        <p role="alert" className="portal-form__error">
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}

      {state.successKey ? (
        <p role="status" className="portal-form__success">
          {t(`success.${state.successKey}`)}
        </p>
      ) : null}

      {state.inviteUrl ? (
        <p className="portal-form__hint">
          {t('devInviteUrlLabel')}{' '}
          <a className="portal-link" href={state.inviteUrl}>
            {state.inviteUrl}
          </a>
        </p>
      ) : null}

      <div className="portal-form__actions">
        <TeButton type="submit" disabled={pending}>
          {t('submit')}
        </TeButton>
      </div>
    </form>
  );
}
